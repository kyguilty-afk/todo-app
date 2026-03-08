# Nexus Todo

ローカル動作するTo-Doリストアプリ。サーバー不要・完全ブラウザ内で動作します。

🔗 **[アプリを開く（GitHub Pages）](https://あなたのGitHubユーザー名.github.io/todo-app/)**

---

## ✨ 機能

- **3階層構造**: 大カテゴリ ＞ 小カテゴリ ＞ タスク
- **期限管理**: 期限日を設定でき、期日順に自動ソート
- **インライン編集**: カテゴリ名・タスク名・日付をその場で編集
- **完全ローカル保存**: LocalStorageで自動保存（ブラウザを閉じても消えない）
- **PCファイル自動同期**: File System Access APIで指定ファイルに常時自動保存（Chrome / Edge）
- **レスポンシブ対応**: 画面幅に合わせて1〜4列グリッドに自動調整

---

## 🚀 GitHub Pages へのデプロイ手順

### 1. リポジトリを作成・プッシュ

```bash
# GitHubで新しいリポジトリを作成後
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/todo-app.git
git push -u origin main
```

### 2. GitHub Pages の設定

1. GitHubのリポジトリページを開く
2. **Settings** → **Pages** を開く
3. **Source** を **GitHub Actions** に変更する

これだけ！ `main` ブランチにプッシュするたびに自動でビルド＆デプロイされます。

### 3. アクセスURL

```
https://あなたのGitHubユーザー名.github.io/todo-app/
```

> ⚠️ **リポジトリ名を変えた場合は `vite.config.ts` の `base` も変更してください。**

---

## 💻 ローカルで開発する場合

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build
```

---

## 🛠 技術スタック

| 技術 | 用途 |
|---|---|
| React 19 + TypeScript | UIフレームワーク |
| Vite | ビルドツール |
| Zustand | 状態管理 |
| LocalStorage | データ永続化 |
| File System Access API | ローカルファイル自動同期 |
| Lucide React | アイコン |

---

## 📄 ライセンス

MIT
