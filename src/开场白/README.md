# 开场白前端

用于《穿越催眠 APP》角色卡第一条消息：在该条消息中只写 `[start]`，通过正则把 `[start]` 替换成本前端的 iframe 嵌入，玩家打开角色卡即可直接看到本界面（无需脚本或变量）。

## 使用步骤

1. **角色卡第一条消息**：内容设为 `[start]`。
2. **正则替换**（在酒馆或酒馆助手中配置）：
   - **匹配**：`\[start\]`
   - **替换**：  
     `<iframe src="本前端部署后的完整 URL" width="100%" style="aspect-ratio:16/10;border:none;min-height:280px;"></iframe>`
3. **部署**：将 `pnpm build` 后生成的 `dist/开场白/index.html` 放到可访问的地址（本地或 CDN），把上面 iframe 的 `src` 换成该地址。

## 开发

- 修改 `Opening.vue` 即可扩展开场白内容与样式。
- 本前端不读取任何酒馆变量，仅作展示。
