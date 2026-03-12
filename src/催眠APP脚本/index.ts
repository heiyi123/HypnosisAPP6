// 催眠APP - 每日结算脚本
// 目标：
// 1) 当「系统.当前时间」跨天但「系统.穿越天数」未更新时，自动将穿越天数 +1
// 2) 按跨越天数恢复「系统._MC能量」（每天恢复「系统._MC能量上限」的 50%）
// 3) 每天降低「系统.主角可疑度」10点，降低每个「角色.*.警戒度」10点
// 4) 每个角色每 5 点「警戒度」，每天会增加 1 点「主角可疑度」
//
// 日期已改为「穿越天数」计数，不再使用公历当前日期。

import _ from 'lodash';

const UPDATE_REASON = '催眠APP脚本：每日结算';

const PATHS = {
  system: '系统',
  roles: '角色',
  /** 穿越第几天，number，从 1 起 */
  dayCount: '系统.穿越天数',
  time: '系统.当前时间',
  suspicion: '系统.主角可疑度',
  mcEnergy: ['系统._MC能量', '系统.MC能量'],
  mcEnergyMax: ['系统._MC能量上限', '系统.MC能量上限'],
} as const;

function toFiniteNumber(val: unknown, fallback: number | null = null): number | null {
  const n = typeof val === 'number' ? val : Number(val);
  return Number.isFinite(n) ? n : fallback;
}

function clampNumber(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function parseTimeToMinutes(time: unknown): number | null {
  if (typeof time !== 'string') return null;
  const m = /^(\d{1,2})\s*:\s*(\d{1,2})(?:\s*:\s*(\d{1,2}))?$/.exec(time.trim());
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  return hh * 60 + mm;
}

/**
 * 根据更新前后「穿越天数」与「当前时间」推断跨了多少天。
 * - 若时间从较大到较小（如 23:00 → 08:00）且穿越天数未变，视为漏写跨天，dayDelta 至少为 1。
 * - 若穿越天数已更新，用前后差值作为 dayDelta。
 */
function resolveDayDelta(
  beforeDayCount: unknown,
  afterDayCount: unknown,
  beforeTime: unknown,
  afterTime: unknown,
): { dayDelta: number; missingDayRollover: boolean; nextDayCount?: number } {
  const beforeN = toFiniteNumber(beforeDayCount, null);
  const afterN = toFiniteNumber(afterDayCount, null);
  const beforeMinutes = parseTimeToMinutes(beforeTime);
  const afterMinutes = parseTimeToMinutes(afterTime);
  const timeCrossed = beforeMinutes !== null && afterMinutes !== null && afterMinutes < beforeMinutes;

  if (beforeN !== null && afterN !== null && afterN > beforeN) {
    return { dayDelta: Math.max(0, Math.floor(afterN - beforeN)), missingDayRollover: false };
  }

  if (beforeN !== null && afterN !== null && beforeN === afterN && timeCrossed) {
    return { dayDelta: 1, missingDayRollover: true, nextDayCount: beforeN + 1 };
  }

  return { dayDelta: 0, missingDayRollover: false };
}

function getMessageVariableOption(): VariableOption {
  try {
    return { type: 'message', message_id: getCurrentMessageId() };
  } catch {
    return { type: 'message', message_id: 'latest' };
  }
}

async function setIfChanged(
  mvu: Mvu.MvuData,
  path: string,
  nextValue: unknown,
  reason = UPDATE_REASON,
): Promise<boolean> {
  const prev = _.get(mvu.stat_data, path);
  if (_.isEqual(prev, nextValue)) return false;

  const setter = (Mvu as any).setMvuVariable as
    | ((mvuData: Mvu.MvuData, variablePath: string, value: unknown, options?: { reason?: string }) => Promise<boolean>)
    | undefined;

  if (typeof setter === 'function') {
    const ok = await setter(mvu, path, nextValue, { reason });
    if (ok) _.set(mvu.stat_data, path, nextValue);
    return ok;
  }

  _.set(mvu.stat_data, path, nextValue);
  return true;
}

function pickExistingPath(statData: Record<string, any>, paths: readonly string[]): string {
  for (const p of paths) {
    if (_.has(statData, p)) return p;
  }
  return paths[0];
}

async function applyDailySettlement(mvu: Mvu.MvuData, before: Mvu.MvuData): Promise<boolean> {
  const statAfter = mvu.stat_data ?? {};
  const statBefore = before?.stat_data ?? {};

  const beforeDayCount = _.get(statBefore, PATHS.dayCount);
  const afterDayCount = _.get(statAfter, PATHS.dayCount);
  const beforeTime = _.get(statBefore, PATHS.time);
  const afterTime = _.get(statAfter, PATHS.time);

  const { dayDelta, missingDayRollover, nextDayCount } = resolveDayDelta(
    beforeDayCount,
    afterDayCount,
    beforeTime,
    afterTime,
  );
  if (dayDelta <= 0 && !missingDayRollover) return false;

  let changed = false;

  if (missingDayRollover && typeof nextDayCount === 'number') {
    if (await setIfChanged(mvu, PATHS.dayCount, nextDayCount)) changed = true;
  }

  const effectiveDayDelta = missingDayRollover ? 1 : dayDelta;
  if (effectiveDayDelta <= 0) return changed;

  const energyPath = pickExistingPath(statAfter, PATHS.mcEnergy);
  const energyMaxPath = pickExistingPath(statAfter, PATHS.mcEnergyMax);
  const energy = toFiniteNumber(_.get(statAfter, energyPath), 0) ?? 0;
  const energyMax = toFiniteNumber(_.get(statAfter, energyMaxPath), null);

  if (energyMax !== null) {
    const safeMax = Math.max(0, energyMax);
    const regenPerDay = safeMax * 0.5;
    const nextEnergy = clampNumber(energy + regenPerDay * effectiveDayDelta, 0, safeMax);
    if (await setIfChanged(mvu, energyPath, nextEnergy)) changed = true;
    for (const aliasPath of [...PATHS.mcEnergy, ...PATHS.mcEnergyMax]) {
      if (!_.has(statAfter, aliasPath)) continue;
      if (aliasPath === energyPath || aliasPath === energyMaxPath) continue;
      const aliasValue = aliasPath.includes('能量上限') ? safeMax : nextEnergy;
      if (await setIfChanged(mvu, aliasPath, aliasValue)) changed = true;
    }
  }

  const suspicion = toFiniteNumber(_.get(statAfter, PATHS.suspicion), null);
  const roles = _.get(statAfter, PATHS.roles);
  let dailySuspicionIncrease = 0;
  if (_.isPlainObject(roles)) {
    for (const [roleName, roleValue] of Object.entries<any>(roles)) {
      if (!roleName) continue;
      if (!_.isPlainObject(roleValue)) continue;
      const alertnessPath = `${PATHS.roles}.${roleName}.警戒度`;
      const alertness = toFiniteNumber(_.get(statAfter, alertnessPath), null);
      if (alertness === null) continue;

      for (let i = 0; i < effectiveDayDelta; i += 1) {
        const alertnessAtStart = Math.max(0, alertness - 10 * i);
        dailySuspicionIncrease += Math.floor(alertnessAtStart / 5);
      }

      const nextAlertness = Math.max(0, alertness - 10 * effectiveDayDelta);
      if (await setIfChanged(mvu, alertnessPath, nextAlertness)) changed = true;
    }
  }

  if (suspicion !== null) {
    const nextSuspicion = Math.max(0, suspicion - 10 * effectiveDayDelta + dailySuspicionIncrease);
    if (await setIfChanged(mvu, PATHS.suspicion, nextSuspicion)) changed = true;
  }

  return changed;
}

$(() => {
  (async () => {
    try {
      await waitGlobalInitialized('Mvu');
    } catch (err) {
      console.warn('[催眠APP脚本] Mvu 未就绪，脚本不生效', err);
      return;
    }

    let isSelfApplying = false;

    eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, async (after: Mvu.MvuData, before: Mvu.MvuData) => {
      if (isSelfApplying) {
        isSelfApplying = false;
        return;
      }

      try {
        const changed = await applyDailySettlement(after, before);
        if (!changed) return;

        isSelfApplying = true;
        await Mvu.replaceMvuData(after, getMessageVariableOption());
      } catch (err) {
        console.error('[催眠APP脚本] 每日结算失败', err);
        isSelfApplying = false;
      }
    });
  })();
});
