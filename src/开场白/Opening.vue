<template>
  <div class="opening">
    <div class="opening__inner">
      <h1 class="opening__title">《异世界穿越APP》</h1>

      <form class="opening__form" @submit.prevent="onSubmit">
        <div class="opening__field">
          <label class="opening__label">目标世界</label>
          <input
            v-model.trim="form.targetWorld"
            type="text"
            class="opening__input"
            placeholder="例如：XX世界 / 某部作品名"
          />
        </div>

        <div class="opening__field">
          <label class="opening__label">穿越方式（二选一）</label>
          <div class="opening__radio-group">
            <label class="opening__radio">
              <input v-model="form.crossType" type="radio" value="肉身穿越" />
              <span>肉身穿越</span>
            </label>
            <label class="opening__radio">
              <input v-model="form.crossType" type="radio" value="替换穿越" />
              <span>替换穿越</span>
            </label>
          </div>
        </div>

        <div class="opening__field">
          <label class="opening__label">主角设定</label>
          <textarea
            v-model.trim="form.protagonist"
            class="opening__textarea"
            rows="3"
            placeholder="简要写出主角人设；若为替换穿越，请写清楚扮演的身份"
          />
        </div>

        <button
          type="submit"
          class="opening__submit"
          :disabled="!canSubmit"
        >
          开始穿越
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
// 不显式 import vue：tsconfig 的 types 白名单会导致在 .vue 中解析不到 'vue' 模块；
// 构建时 unplugin-auto-import 会注入 reactive/computed，auto-imports.d.ts 也声明了全局。
const form = reactive({
  targetWorld: '',
  crossType: '' as '' | '肉身穿越' | '替换穿越',
  protagonist: '',
});

const canSubmit = computed(() => {
  return (
    form.targetWorld.length > 0 &&
    (form.crossType === '肉身穿越' || form.crossType === '替换穿越') &&
    form.protagonist.length > 0
  );
});

function buildMessage(): string {
  const lines = [
    '生成开场白：',
    '说明：肉身穿越 = 以外来人的身份直接穿越到异世界；替换穿越 = 获得一个已存在的异世界身份开局。',
    `目标世界：${form.targetWorld}`,
    `穿越方式：${form.crossType}`,
    `主角设定：${form.protagonist}`,
  ];
  return lines.join('\n');
}

async function onSubmit() {
  if (!canSubmit.value) return;
  const message = buildMessage();
  try {
    await generate({ user_input: message });
  } catch (e) {
    console.error('开场白发送失败', e);
  }
}
</script>

<style scoped>
.opening {
  width: 100%;
  min-height: 280px;
  padding: 1rem;
  box-sizing: border-box;
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%);
  color: #e0e7ff;
}
.opening__inner {
  max-width: 24rem;
  margin: 0 auto;
}
.opening__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 1rem;
  text-align: center;
  letter-spacing: 0.05em;
}
.opening__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.opening__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.opening__label {
  font-size: 0.875rem;
  font-weight: 600;
  opacity: 0.95;
}
.opening__input,
.opening__textarea {
  width: 100%;
  padding: 0.5rem 0.6rem;
  font-size: 0.875rem;
  color: #e5e7eb;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(129, 140, 248, 0.6);
  border-radius: 6px;
  box-sizing: border-box;
}
.opening__textarea {
  resize: vertical;
  min-height: 4rem;
}
.opening__input::placeholder,
.opening__textarea::placeholder {
  color: #9ca3af;
  opacity: 0.9;
}
.opening__radio-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.opening__radio {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.875rem;
  cursor: pointer;
}
.opening__radio input {
  accent-color: #818cf8;
}
.opening__hint {
  font-size: 0.75rem;
  opacity: 0.85;
  margin: 0;
  padding: 0.25rem 0;
}
.opening__submit {
  margin-top: 0.5rem;
  padding: 0.6rem 1rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1e1b4b;
  background: linear-gradient(180deg, #a5b4fc 0%, #818cf8 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.opening__submit:hover:not(:disabled) {
  background: linear-gradient(180deg, #c7d2fe 0%, #a5b4fc 100%);
}
.opening__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
