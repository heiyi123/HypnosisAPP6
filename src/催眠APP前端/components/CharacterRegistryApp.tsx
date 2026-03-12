import { ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import React, { useState } from 'react';
import { MvuBridge } from '../services/mvuBridge';

interface CharacterRegistryAppProps {
  onBack: () => void;
}

const ENTRY_NAME_PREFIX = '[mvu_update]';
const ENTRY_NAME_SUFFIX = '变量';

function buildVariableEntryName(roleName: string): string {
  return `${ENTRY_NAME_PREFIX}${roleName}${ENTRY_NAME_SUFFIX}`;
}

/**
 * 角色锁定：只输入当前世界观里已存在的角色名称。
 * 人设与剧情设定由外挂世界书负责；此处仅在世界书中插入「调用该角色 MVU 变量」的绿灯条目，并确保 MVU 中存在该角色键（默认数值模板）。
 */
export const CharacterRegistryApp: React.FC<CharacterRegistryAppProps> = ({ onBack }) => {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  /** 锁定成功时短暂展示，比底部小条更显眼 */
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const showNotice = (text: string, durationMs = 2800) => {
    setNotice(text);
    window.setTimeout(() => setNotice(null), durationMs);
  };

  const showSuccessBanner = (roleName: string) => {
    setSuccessBanner(roleName);
    window.setTimeout(() => setSuccessBanner(null), 3200);
    try {
      toastr.success(`「${roleName}」已加入变量回调`, '锁定成功');
    } catch {
      // toastr 不可用时仅依赖横幅
    }
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      showNotice('请先填写角色名称');
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    try {
      const charBooks = getCharWorldbookNames('current');
      const worldbookName =
        charBooks.primary ??
        charBooks.additional[0] ??
        ((await getChatWorldbookName('current')) ?? (await getOrCreateChatWorldbook('current')));

      const entryName = buildVariableEntryName(trimmedName);
      const worldbook = await getWorldbook(worldbookName);
      const alreadyExists = worldbook.some(e => e.name === entryName);
      if (alreadyExists) {
        try {
          toastr.warning('该角色已有变量条目，未作任何修改', '已存在角色');
        } catch {
          // ignore
        }
        showNotice('已存在角色（未添加新条目）', 4000);
        return;
      }

      await createWorldbookEntries(
        worldbookName,
        [
          {
            name: entryName,
            enabled: true,
            strategy: {
              type: 'selective',
              keys: [trimmedName],
              keys_secondary: { logic: 'and_any', keys: [] },
              scan_depth: 'same_as_global',
            },
            position: {
              type: 'before_character_definition',
              role: 'system',
              depth: 0,
              order: 35,
            },
            content: `${trimmedName}:\n  {{format_message_variable::stat_data.角色.${trimmedName}}}`,
            probability: 100,
            recursion: { prevent_incoming: true, prevent_outgoing: true, delay_until: null },
            effect: { sticky: null, cooldown: null, delay: null },
          },
        ],
        { render: 'debounced' },
      );

      await MvuBridge.createRoleIfMissing(trimmedName, {
        好感度: 0,
        警戒度: 0,
        服从度: 0,
        性欲: 0,
        快感值: 0,
        阴蒂敏感度: 100,
        小穴敏感度: 100,
        菊穴敏感度: 150,
        尿道敏感度: 100,
        乳头敏感度: 100,
        临时催眠效果: {},
        永久催眠效果: {},
        阴蒂高潮次数: 0,
        小穴高潮次数: 0,
        菊穴高潮次数: 0,
        尿道高潮次数: 0,
        乳头高潮次数: 0,
      });

      showSuccessBanner(trimmedName);
    } catch (err) {
      console.warn('[HypnoOS] 角色锁定失败', err);
      showNotice('角色锁定失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white animate-fade-in relative overflow-hidden">
      {/* 锁定成功全屏显眼提示 */}
      {successBanner && (
        <div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-emerald-950/95 backdrop-blur-md animate-fade-in"
          aria-live="polite"
        >
          <CheckCircle2 className="text-emerald-400 mb-4" size={56} strokeWidth={2} />
          <p className="text-2xl font-bold text-white tracking-wide">锁定成功</p>
          <p className="mt-2 text-lg text-emerald-200/95">「{successBanner}」</p>
          <p className="mt-3 text-sm text-emerald-400/80">已添加世界书变量回调条目</p>
        </div>
      )}

      <div className="px-4 py-4 pt-6 flex items-center justify-between z-10 bg-slate-900/90 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="text-gray-300" size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-wide">角色锁定</h1>
            <p className="text-xs text-gray-400">
              输入当前世界里已有角色的名称即可；详细人设由外挂世界书提供，此处只绑定 MVU 变量回调
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        <section className="space-y-2">
          <h2 className="text-xs font-semibold text-gray-400">锁定目标</h2>
          <div className="space-y-2 bg-white/5 rounded-xl p-3 border border-white/10">
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-gray-300">
                角色名称 <span className="text-red-400">*</span>
              </span>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="与剧情/世界书中出现的名称一致"
                className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
              />
            </label>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              锁定后会在世界书中加入仅包含变量调用的条目（绿灯关键字即为该名称）。若已存在同名条目，将提示「已存在角色」且不会重复添加。
            </p>
          </div>
        </section>
      </div>

      <div className="px-4 pb-6 pt-3 bg-slate-900/90 border-t border-white/10 backdrop-blur-md">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !name.trim()}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold shadow-lg transition-all
            ${submitting || !name.trim()
              ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black hover:shadow-emerald-500/40 active:scale-95'
            }`}
        >
          <Lock size={18} />
          确认锁定
        </button>
      </div>

      {notice && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-24 px-4 py-2 rounded-xl bg-amber-950/90 text-amber-100 text-sm border border-amber-500/40 shadow-xl backdrop-blur-sm max-w-[90%] text-center">
          {notice}
        </div>
      )}
    </div>
  );
};
