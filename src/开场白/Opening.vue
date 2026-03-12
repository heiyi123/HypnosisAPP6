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
          <label class="opening__label">穿越方式</label>
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
            placeholder="一句话概括主角人设；替换穿越请写清在异世界的身份"
          />
        </div>

        <button
          type="submit"
          class="opening__submit"
          :disabled="!canSubmit || sending"
        >
          {{ sending ? '正在向 AI 发送开场白…' : '开始穿越' }}
        </button>
      </form>

      <div v-if="canSubmit" class="opening__preview">
        <div class="opening__preview-title">将发送给 AI 的开场白指令预览</div>
        <pre class="opening__preview-body">{{ preview }}</pre>
      </div>
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

const sending = ref(false);

const canSubmit = computed(() => {
  return (
    form.targetWorld.length > 0 &&
    (form.crossType === '肉身穿越' || form.crossType === '替换穿越') &&
    form.protagonist.length > 0
  );
});

const preview = computed(() => buildMessage());

function buildMessage(): string {
  const lines = [
    '开始生成开场白',
    `目标世界：${form.targetWorld}`,
    `穿越方式：${form.crossType}`,
    `主角设定：${form.protagonist}`,
  ];
  return lines.join('\n');
}

async function onSubmit() {
  if (!canSubmit.value || sending.value) return;
  const message = buildMessage();
  sending.value = true;
  try {
    // 将开场白指令填入酒馆的发送输入框，让玩家自行点击发送/重新生成
    $('#send_textarea').val(message).trigger('input');
    console.info('开场白消息已填入输入框', { message });
  } catch (e) {
    console.error('开场白消息填入输入框失败', e);
    (window as unknown as { toastr?: { error?: (msg: string) => void } }).toastr?.error?.(
      '开场白消息填入失败，请稍后重试。',
    );
  } finally {
    sending.value = false;
  }
}
</script>

<style scoped>
.opening {
  width: 100%;
  min-height: 100%;
  padding: 2rem 1.5rem;
  box-sizing: border-box;
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%);
  color: #e0e7ff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.opening__inner {
  width: 100%;
  max-width: 32rem;
  margin: 0 auto;
  padding: 1.75rem 1.5rem 1.5rem;
  border-radius: 16px;
  background: radial-gradient(circle at top, rgba(129, 140, 248, 0.4), transparent 55%),
    rgba(15, 23, 42, 0.96);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.75);
}
.opening__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem;
  text-align: center;
  letter-spacing: 0.05em;
}
.opening__subtitle {
  margin: 0 0 1rem;
  font-size: 0.8125rem;
  line-height: 1.4;
  color: #c7d2fe;
  text-align: left;
}
.opening__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.opening__field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.opening__label {
  font-size: 0.9rem;
  font-weight: 600;
  opacity: 0.96;
}
.opening__input,
.opening__textarea {
  width: 100%;
  padding: 0.55rem 0.7rem;
  font-size: 0.9rem;
  color: #e5e7eb;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(129, 140, 248, 0.7);
  border-radius: 8px;
  box-sizing: border-box;
}
.opening__textarea {
  resize: vertical;
  min-height: 4.2rem;
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
  font-size: 0.88rem;
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
.opening__hint--bottom {
  margin-top: 0.25rem;
}
.opening__submit {
  margin-top: 0.75rem;
  padding: 0.7rem 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  color: #1e1b4b;
  background: linear-gradient(180deg, #a5b4fc 0%, #818cf8 100%);
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: transform 0.12s ease-out, box-shadow 0.12s ease-out, background 0.12s ease-out,
    opacity 0.12s ease-out;
}
.opening__submit:hover:not(:disabled) {
  background: linear-gradient(180deg, #c7d2fe 0%, #a5b4fc 100%);
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.6);
}
.opening__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.opening__preview {
  margin-top: 1.5rem;
  padding: 0.85rem 0.8rem 0.75rem;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(129, 140, 248, 0.7);
}
.opening__preview-title {
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
  color: #c7d2fe;
}
.opening__preview-body {
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 8rem;
  overflow-y: auto;
}
</style>
