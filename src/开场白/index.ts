/**
 * 开场白前端：在角色卡第一条消息中写 [start]，用正则将该占位替换为本前端的 iframe 嵌入后，
 * 玩家打开角色卡即可在此条消息位置直接看到本界面（无需脚本或变量）。
 *
 * 正则替换示例（在酒馆/助手中配置）：
 *   匹配: \[start\]
 *   替换: <iframe src="本前端部署后的完整URL" width="100%" style="aspect-ratio:16/10;border:none;min-height:280px;"></iframe>
 * 部署后把 src 换成实际 URL（如 dist 输出或 CDN 地址）。
 */
import { createApp } from 'vue';
import Opening from './Opening.vue';

$(() => {
  createApp(Opening).mount('#app');
});
