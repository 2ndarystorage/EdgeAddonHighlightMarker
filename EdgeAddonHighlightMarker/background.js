// background.js - Service Worker (Edge Addon)

const MENU_ID_ROOT = "edge-highlight-marker";

// デバウンスタイマー（連続呼び出し防止）
let _menuUpdateTimer = null;

// コンテキストメニューの作成
function createContextMenus(presets) {
  if (_menuUpdateTimer) clearTimeout(_menuUpdateTimer);
  _menuUpdateTimer = setTimeout(() => {
    _menuUpdateTimer = null;
    _doCreateContextMenus(presets);
  }, 50);
}

function _doCreateContextMenus(presets) {
  chrome.contextMenus.removeAll(() => {
    // ルートメニュー
    chrome.contextMenus.create({
      id: MENU_ID_ROOT,
      title: "🖊️ ハイライトマーカー",
      contexts: ["selection"]
    });

    // プリセットメニュー
    if (presets && presets.length > 0) {
      presets.forEach((preset, index) => {
        if (preset.name) {
          chrome.contextMenus.create({
            id: `${MENU_ID_ROOT}-preset-${index}`,
            parentId: MENU_ID_ROOT,
            title: `${preset.emoji || "🔹"} ${preset.name}`,
            contexts: ["selection"]
          });
        }
      });

      chrome.contextMenus.create({
        id: `${MENU_ID_ROOT}-separator`,
        parentId: MENU_ID_ROOT,
        type: "separator",
        contexts: ["selection"]
      });
    }

    // ハイライト削除
    chrome.contextMenus.create({
      id: `${MENU_ID_ROOT}-clear`,
      parentId: MENU_ID_ROOT,
      title: "🗑️ ハイライトをすべて削除",
      contexts: ["selection", "page"]
    });

    // 設定を開く
    chrome.contextMenus.create({
      id: `${MENU_ID_ROOT}-options`,
      parentId: MENU_ID_ROOT,
      title: "⚙️ 設定を開く",
      contexts: ["selection", "page"]
    });
  });
}

// 初期化
chrome.runtime.onInstalled.addListener(async () => {
  // デフォルトプリセット
  const defaultPresets = [
    {
      name: "重要（赤）",
      emoji: "🔴",
      textColor: "#ffffff",
      bgColor: "#e53e3e",
      bold: true,
      blink: false,
      border: false,
      borderColor: "#c53030",
      underline: false
    },
    {
      name: "注意（黄）",
      emoji: "🟡",
      textColor: "#744210",
      bgColor: "#fefcbf",
      bold: true,
      blink: false,
      border: true,
      borderColor: "#f6e05e",
      underline: false
    },
    {
      name: "OK（緑）",
      emoji: "🟢",
      textColor: "#ffffff",
      bgColor: "#38a169",
      bold: false,
      blink: false,
      border: false,
      borderColor: "#276749",
      underline: false
    },
    {
      name: "点滅（警告）",
      emoji: "⚡",
      textColor: "#ffffff",
      bgColor: "#e53e3e",
      bold: true,
      blink: true,
      border: true,
      borderColor: "#fc8181",
      underline: false
    },
    {
      name: "マーカー（青）",
      emoji: "🔵",
      textColor: "#1a365d",
      bgColor: "#bee3f8",
      bold: false,
      blink: false,
      border: false,
      borderColor: "#90cdf4",
      underline: false
    }
  ];

  const result = await chrome.storage.sync.get("presets");
  if (!result.presets) {
    await chrome.storage.sync.set({ presets: defaultPresets });
  }

  const presetsToUse = result.presets || defaultPresets;
  createContextMenus(presetsToUse);
});

// ストレージ変更時にメニューを更新
chrome.storage.onChanged.addListener((changes) => {
  if (changes.presets) {
    createContextMenus(changes.presets.newValue);
  }
});

// コンテキストメニュークリック処理
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;

  if (info.menuItemId === `${MENU_ID_ROOT}-options`) {
    chrome.runtime.openOptionsPage();
    return;
  }

  if (info.menuItemId === `${MENU_ID_ROOT}-clear`) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        if (window.edgeHighlightMarker) {
          window.edgeHighlightMarker.clearAll();
        }
      }
    });
    return;
  }

  // プリセット適用
  const match = info.menuItemId.match(/edge-highlight-marker-preset-(\d+)/);
  if (match) {
    const index = parseInt(match[1]);
    const result = await chrome.storage.sync.get("presets");
    const presets = result.presets || [];
    const preset = presets[index];

    if (preset) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (presetData) => {
          if (window.edgeHighlightMarker) {
            window.edgeHighlightMarker.applyHighlight(presetData);
          }
        },
        args: [preset]
      });
    }
  }
});

// 起動時にメニューを復元
chrome.runtime.onStartup.addListener(async () => {
  const result = await chrome.storage.sync.get("presets");
  createContextMenus(result.presets || []);
});
