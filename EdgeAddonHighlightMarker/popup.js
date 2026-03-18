// popup.js (Edge Addon)

async function init() {
  // バージョン表示
  const manifest = chrome.runtime.getManifest();
  const verEl = document.getElementById("ver");
  if (verEl) verEl.textContent = "v" + manifest.version;

  const result = await chrome.storage.sync.get(["presets", "registeredStrings"]);
  const presets = result.presets || [];
  const registeredStrings = result.registeredStrings || [];
  const list = document.getElementById("presetsList");

  presets.forEach((preset) => {
    const div = document.createElement("div");
    div.className = "preset-badge";
    div.innerHTML = `
      <div class="preset-badge-swatch" style="background:${preset.bgColor};border:1px solid ${preset.borderColor || preset.bgColor}"></div>
      <span class="preset-badge-name">${preset.emoji || ''} ${preset.name}</span>
    `;
    list.appendChild(div);
  });

  if (presets.length === 0) {
    list.innerHTML = '<div style="font-size:12px;color:#64748b;text-align:center;padding:8px">プリセットがありません</div>';
  }

  // 登録文字列サマリー
  if (registeredStrings.length > 0) {
    const summary = document.createElement("div");
    summary.style.cssText = "font-size:11px;color:#3ba55d;background:rgba(59,165,93,0.1);border:1px solid rgba(59,165,93,0.2);border-radius:6px;padding:6px 10px;margin-top:8px;";
    summary.textContent = `📌 自動ハイライト: ${registeredStrings.length} 件登録中`;
    document.querySelector(".popup-body").insertBefore(summary, document.getElementById("openOptions"));
  }
}

document.getElementById("openOptions").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

init();
