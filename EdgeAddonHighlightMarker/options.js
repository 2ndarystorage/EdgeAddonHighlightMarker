// options.js v1.0.0 (Edge Addon)

const VERSION = "1.0.0";

let presets = [];
let registeredStrings = [];

const defaultPresets = [
  { name: "重要（赤）", emoji: "🔴", textColor: "#ffffff", bgColor: "#e53e3e", bold: true, blink: false, border: false, borderColor: "#c53030", underline: false },
  { name: "注意（黄）", emoji: "🟡", textColor: "#744210", bgColor: "#fefcbf", bold: true, blink: false, border: true, borderColor: "#f6e05e", underline: false },
  { name: "OK（緑）", emoji: "🟢", textColor: "#ffffff", bgColor: "#38a169", bold: false, blink: false, border: false, borderColor: "#276749", underline: false },
  { name: "点滅（警告）", emoji: "⚡", textColor: "#ffffff", bgColor: "#e53e3e", bold: true, blink: true, border: true, borderColor: "#fc8181", underline: false },
  { name: "マーカー（青）", emoji: "🔵", textColor: "#1a365d", bgColor: "#bee3f8", bold: false, blink: false, border: false, borderColor: "#90cdf4", underline: false }
];

// ===== バージョン表示 =====
document.getElementById("versionBadge").textContent = "v" + VERSION;

// ===== プリセット =====
function buildPreviewStyle(preset) {
  let style = `color:${preset.textColor};background-color:${preset.bgColor};padding:3px 10px;border-radius:5px;font-size:13px;`;
  if (preset.bold) style += "font-weight:bold;";
  if (preset.underline) style += "text-decoration:underline;";
  if (preset.border) style += `border:2px solid ${preset.borderColor};`;
  return style;
}

function renderPresets() {
  const grid = document.getElementById("presetsGrid");
  grid.innerHTML = "";
  presets.forEach((preset, index) => {
    const card = document.createElement("div");
    card.className = "preset-card";
    card.dataset.index = index;
    const previewStyle = buildPreviewStyle(preset);
    const blinkClass = preset.blink ? " blink-preview" : "";
    card.innerHTML = `
      <div class="preset-number">${index + 1}</div>
      <div>
        <div class="preset-header">
          <input type="text" class="emoji-input" value="${preset.emoji || '🔹'}" data-field="emoji" maxlength="2" title="絵文字">
          <input type="text" class="preset-name-input" value="${preset.name}" data-field="name" placeholder="プリセット名">
          <span class="preset-preview${blinkClass}" style="${previewStyle}">サンプルテキスト</span>
        </div>
        <div class="preset-body">
          <div class="form-group">
            <div class="form-label">文字色</div>
            <div class="color-row">
              <input type="color" value="${preset.textColor}" data-field="textColor">
              <input type="text" class="color-hex" value="${preset.textColor}" data-field="textColor" data-hex="true">
            </div>
          </div>
          <div class="form-group">
            <div class="form-label">背景色</div>
            <div class="color-row">
              <input type="color" value="${preset.bgColor}" data-field="bgColor">
              <input type="text" class="color-hex" value="${preset.bgColor}" data-field="bgColor" data-hex="true">
            </div>
          </div>
          <div class="form-group">
            <div class="form-label">枠線色</div>
            <div class="color-row">
              <input type="color" value="${preset.borderColor || '#000000'}" data-field="borderColor">
              <input type="text" class="color-hex" value="${preset.borderColor || '#000000'}" data-field="borderColor" data-hex="true">
            </div>
          </div>
          <div class="form-group" style="grid-column:1/-1">
            <div class="form-label">スタイル</div>
            <div class="toggles-row">
              <label class="toggle-chip ${preset.bold ? 'active' : ''}">
                <input type="checkbox" data-field="bold" ${preset.bold ? 'checked' : ''}>
                <span class="chip-dot"></span> 太字
              </label>
              <label class="toggle-chip ${preset.underline ? 'active' : ''}">
                <input type="checkbox" data-field="underline" ${preset.underline ? 'checked' : ''}>
                <span class="chip-dot"></span> 下線
              </label>
              <label class="toggle-chip ${preset.border ? 'active' : ''}">
                <input type="checkbox" data-field="border" ${preset.border ? 'checked' : ''}>
                <span class="chip-dot"></span> 枠線
              </label>
              <label class="toggle-chip ${preset.blink ? 'active' : ''}" ${preset.blink ? 'style="animation:preview-blink 1s ease-in-out infinite"' : ''}>
                <input type="checkbox" data-field="blink" ${preset.blink ? 'checked' : ''}>
                <span class="chip-dot"></span> ⚡ 点滅
              </label>
            </div>
          </div>
        </div>
      </div>
      <div class="preset-controls">
        <button class="btn-collapse" data-action="toggle" title="折りたたむ">▲</button>
        <button class="btn-icon" data-action="delete" title="削除">🗑</button>
      </div>
    `;
    setupCardEvents(card, index);
    grid.appendChild(card);
  });

  // 登録文字列のプリセット選択肢も更新
  refreshPresetSelects();
}

function setupCardEvents(card, index) {
  card.querySelectorAll("input[data-field]").forEach((input) => {
    const field = input.dataset.field;
    if (input.type === "color") {
      input.addEventListener("input", () => {
        presets[index][field] = input.value;
        const hexInput = card.querySelector(`input[data-field="${field}"][data-hex]`);
        if (hexInput) hexInput.value = input.value;
        updatePreview(card, index);
      });
    } else if (input.dataset.hex) {
      input.addEventListener("input", () => {
        const val = input.value.trim();
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
          presets[index][field] = val;
          const colorInput = card.querySelector(`input[type="color"][data-field="${field}"]`);
          if (colorInput) colorInput.value = val;
          updatePreview(card, index);
        }
      });
    } else if (input.type === "checkbox") {
      input.addEventListener("change", () => {
        presets[index][field] = input.checked;
        const chip = input.closest(".toggle-chip");
        chip.classList.toggle("active", input.checked);
        if (field === "blink") chip.style.animation = input.checked ? "preview-blink 1s ease-in-out infinite" : "";
        updatePreview(card, index);
      });
    } else {
      input.addEventListener("input", () => {
        presets[index][field] = input.value;
        updatePreview(card, index);
      });
    }
  });

  card.querySelector("[data-action='toggle']").addEventListener("click", () => {
    card.classList.toggle("collapsed");
    card.querySelector("[data-action='toggle']").textContent = card.classList.contains("collapsed") ? "▼" : "▲";
  });

  card.querySelector("[data-action='delete']").addEventListener("click", () => {
    if (confirm(`プリセット「${presets[index].name}」を削除しますか？`)) {
      presets.splice(index, 1);
      renderPresets();
      renderStringsTable();
    }
  });
}

function updatePreview(card, index) {
  const preset = presets[index];
  const preview = card.querySelector(".preset-preview");
  if (!preview) return;
  preview.setAttribute("style", buildPreviewStyle(preset));
  preview.className = "preset-preview" + (preset.blink ? " blink-preview" : "");
}

// ===== 登録文字列 =====

function refreshPresetSelects() {
  // 追加フォームのselect
  const sel = document.getElementById("newStringPreset");
  if (sel) {
    const cur = sel.value;
    sel.innerHTML = presets.map((p, i) =>
      `<option value="${i}">${p.emoji || ''} ${p.name}</option>`
    ).join("");
    if (cur !== "" && cur < presets.length) sel.value = cur;
  }

  // テーブル内のselect
  document.querySelectorAll(".str-preset-select").forEach(s => {
    const row = parseInt(s.dataset.row);
    const cur = s.value;
    s.innerHTML = presets.map((p, i) =>
      `<option value="${i}">${p.emoji || ''} ${p.name}</option>`
    ).join("");
    s.value = cur < presets.length ? cur : 0;
    registeredStrings[row].presetIndex = parseInt(s.value);
  });
}

function buildStrPreviewStyle(presetIndex) {
  const preset = presets[presetIndex] || presets[0];
  if (!preset) return "";
  let style = `color:${preset.textColor};background-color:${preset.bgColor};padding:2px 10px;border-radius:4px;font-size:12px;`;
  if (preset.bold) style += "font-weight:bold;";
  if (preset.border) style += `border:2px solid ${preset.borderColor};`;
  return style;
}

function renderStringsTable() {
  const tbody = document.getElementById("stringsTableBody");
  if (registeredStrings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="strings-empty">登録されている文字列はありません</td></tr>';
    return;
  }

  tbody.innerHTML = "";
  registeredStrings.forEach((entry, i) => {
    const tr = document.createElement("tr");
    const previewStyle = buildStrPreviewStyle(entry.presetIndex);
    const presetOptions = presets.map((p, pi) =>
      `<option value="${pi}" ${pi === entry.presetIndex ? 'selected' : ''}>${p.emoji || ''} ${p.name}</option>`
    ).join("");

    tr.innerHTML = `
      <td class="string-text-cell">${escapeHtml(entry.text)}</td>
      <td>
        <select class="preset-select str-preset-select" style="font-size:12px;padding:5px 8px;min-width:120px" data-row="${i}">
          ${presetOptions}
        </select>
      </td>
      <td class="string-case-cell">
        <span class="case-badge ${entry.caseSensitive ? 'cs' : ''}">
          ${entry.caseSensitive ? '大小区別' : '大小無視'}
        </span>
      </td>
      <td style="text-align:right">
        <button class="btn-icon str-delete-btn" data-row="${i}" title="削除">🗑</button>
      </td>
    `;

    tr.querySelector(".str-preset-select").addEventListener("change", function() {
      registeredStrings[i].presetIndex = parseInt(this.value);
    });

    tr.querySelector(".str-delete-btn").addEventListener("click", function() {
      registeredStrings.splice(i, 1);
      renderStringsTable();
      showToast("🗑️ 削除しました（保存してください）");
    });

    tbody.appendChild(tr);
  });
}

function escapeHtml(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// 大文字小文字チップ
document.getElementById("caseChip").addEventListener("click", function() {
  this.classList.toggle("active");
  const chk = document.getElementById("newStringCase");
  chk.checked = !chk.checked;
  this.querySelector(".chip-dot").style.background = chk.checked ? "var(--accent)" : "";
});

document.getElementById("addStringBtn").addEventListener("click", () => {
  const text = document.getElementById("newStringText").value.trim();
  if (!text) { showToast("⚠️ 文字列を入力してください"); return; }
  const presetIndex = parseInt(document.getElementById("newStringPreset").value) || 0;
  const caseSensitive = document.getElementById("newStringCase").checked;

  // 重複チェック
  if (registeredStrings.some(e => e.text === text && e.caseSensitive === caseSensitive)) {
    showToast("⚠️ 同じ文字列がすでに登録されています");
    return;
  }

  registeredStrings.push({ text, presetIndex, caseSensitive });
  renderStringsTable();
  document.getElementById("newStringText").value = "";
  showToast("➕ 追加しました（保存してください）");
});

// Enterキーでも追加
document.getElementById("newStringText").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("addStringBtn").click();
});

// ===== 保存 =====
async function saveAll() {
  await chrome.storage.sync.set({ presets, registeredStrings });
  showToast("✅ 設定を保存しました");
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// ===== 初期化 =====
async function init() {
  const result = await chrome.storage.sync.get(["presets", "registeredStrings"]);
  presets = result.presets ? JSON.parse(JSON.stringify(result.presets)) : [...defaultPresets];
  registeredStrings = result.registeredStrings ? JSON.parse(JSON.stringify(result.registeredStrings)) : [];
  renderPresets();
  renderStringsTable();
}

document.getElementById("saveBtn").addEventListener("click", saveAll);

document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("プリセットをデフォルトに戻しますか？（登録文字列は保持されます）")) {
    presets = JSON.parse(JSON.stringify(defaultPresets));
    renderPresets();
    renderStringsTable();
    showToast("↺ プリセットをデフォルトに戻しました");
  }
});

document.getElementById("addPresetBtn").addEventListener("click", () => {
  presets.push({ name: `プリセット ${presets.length + 1}`, emoji: "🔹", textColor: "#ffffff", bgColor: "#3ba55d", bold: false, blink: false, border: false, borderColor: "#2d8049", underline: false });
  renderPresets();
  document.getElementById("presetsGrid").lastElementChild?.scrollIntoView({ behavior: "smooth" });
});

document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); saveAll(); }
});

init();
