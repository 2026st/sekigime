# Cloudflare デプロイ + Firestore データ層（実装サマリ）

**日付**: 2026-05-20

## 目的

- ホスティング: OpenNext 経由で **Cloudflare**（`wrangler` / GitHub Actions）。
- 永続化: **Cloud Firestore** + **firebase-admin**（API Routes のみ）。
- **Firebase MCP**: `firebase_init` で Firestore 設定をワークスペースに追加済み。`firebase_deploy` は Firebase CLI 未ログインのため本環境では未実行。利用者は `firebase login` 後に `firebase deploy --only firestore` または MCP の `firebase_deploy` を実行する。
- **Cloudflare MCP**: デプロイ API はないため、アプリの本番デプロイは **Wrangler / CI** が本体（[docs/20260518-cloudflare-pages-deploy.md](20260518-cloudflare-pages-deploy.md)）。

## コード変更

| 箇所 | 内容 |
|------|------|
| [`src/lib/kv.ts`](../src/lib/kv.ts) | `events/{eventId}` へ read/write。`FIREBASE_SERVICE_ACCOUNT_JSON_B64` 未設定時はインメモリ。 |
| [`package.json`](../package.json) | `@upstash/redis` 削除、`firebase-admin` 追加 |
| [`pnpm-workspace.yaml`](../pnpm-workspace.yaml) | `allowBuilds` に `@firebase/util`, `protobufjs` を追加（pnpm の postinstall 許可） |
| [`firestore.rules`](../firestore.rules) | クライアント read/write 全面拒否（Admin SDK のみ運用想定） |
| [`firebase.json`](../firebase.json) / [`firestore.indexes.json`](../firestore.indexes.json) | Firestore デプロイ用 |
| [`.firebaserc.example`](../.firebaserc.example) | プロジェクト ID の雛形 |

## 環境変数

- **`FIREBASE_SERVICE_ACCOUNT_JSON_B64`**: GCP サービスアカウント JSON を Base64 化した 1 文字列。Cloudflare ダッシュボードと GitHub Secrets の両方に設定することを推奨。

## 検証

- `pnpm run build`（Next.js）: 成功を確認。
- `opennextjs-cloudflare build`: Windows では symlink 制限で失敗しうる。CI（ubuntu）または WSL で確認すること。
