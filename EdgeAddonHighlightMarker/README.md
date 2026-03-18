# EdgeAddonHighlightMarker

🖊️ **ハイライトマーカー** - Microsoft Edge アドオン

Webページ上のテキストを強調表示（文字色・背景色・点滅など）するEdgeアドオンです。  
Redmine等のプロジェクト管理ツールでのテキスト強調に最適です。

## 機能

### 手動ハイライト
- テキストを選択 → 右クリック → プリセットを選択してハイライト適用
- ハイライトをクリックで個別削除
- 右クリックメニューから一括削除

### 自動ハイライト（登録文字列）
- 事前に登録した文字列をページロード時に自動で強調表示
- 大文字・小文字の区別オプション
- プリセットごとに異なるスタイルを割り当て可能

### カスタマイズ可能なプリセット
- 文字色・背景色・枠線色を自由に設定
- 太字・下線・枠線・点滅エフェクト
- 絵文字アイコンとプリセット名のカスタマイズ
- デフォルト5種類のプリセット付き

## デフォルトプリセット

| プリセット | 絵文字 | 用途 |
|-----------|--------|------|
| 重要（赤） | 🔴 | 重要な情報の強調 |
| 注意（黄） | 🟡 | 注意が必要な箇所 |
| OK（緑） | 🟢 | 確認済み・完了 |
| 点滅（警告） | ⚡ | 緊急の警告表示 |
| マーカー（青） | 🔵 | 一般的なマーキング |

## インストール方法

### 開発者モードでのインストール

1. このリポジトリをクローンまたはダウンロード
   ```bash
   git clone https://github.com/<YOUR_USERNAME>/EdgeAddonHighlightMarker.git
   ```

2. Microsoft Edgeで `edge://extensions/` を開く

3. 左下の **「開発者モード」** をオンにする

4. **「展開して読み込み」** をクリック

5. クローンした `EdgeAddonHighlightMarker` フォルダを選択

6. アドオンが有効になったことを確認

### Edge アドオンストアからのインストール
> 準備中

## 使い方

1. **手動ハイライト**: テキストを選択 → 右クリック → 「🖊️ ハイライトマーカー」→ プリセットを選択
2. **自動ハイライト**: アドオンアイコン → ⚙️ 設定 → 登録文字列に追加 → 保存
3. **ハイライト削除**: ハイライトされたテキストをクリック、または右クリック → 一括削除
4. **設定変更**: Ctrl+S（Cmd+S）で素早く保存

## ファイル構成

```
EdgeAddonHighlightMarker/
├── manifest.json      # アドオン設定（Manifest V3）
├── background.js      # Service Worker（コンテキストメニュー管理）
├── content.js         # コンテンツスクリプト（ハイライト処理）
├── highlight.css      # ハイライト用スタイル
├── popup.html         # ポップアップUI
├── popup.js           # ポップアップロジック
├── options.html       # 設定画面UI
├── options.js         # 設定画面ロジック
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## 技術仕様

- **Manifest Version**: 3
- **API**: chrome.contextMenus, chrome.storage.sync, chrome.scripting
- **対応ブラウザ**: Microsoft Edge (Chromium版)
- **権限**: contextMenus, storage, activeTab, scripting

## 元プロジェクト

Chrome拡張機能「Redmine ハイライター」をベースに、Edge アドオン向けに最適化しました。

## ライセンス

MIT License
