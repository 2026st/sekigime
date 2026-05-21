# Cloudflare 本番で「席決めを始める」が動かない問題の修正

## 変更内容

- `firebase-admin` を削除し、Cloudflare Workers 上で動作する **Firestore REST API**（`fetch` + サービスアカウント JWT）に置き換えた。
- 新規: [`src/lib/firestore-rest.ts`](../src/lib/firestore-rest.ts)
- 更新: [`src/lib/kv.ts`](../src/lib/kv.ts) — 環境変数未設定時は従来どおりインメモリ

## 原因

OpenNext + Cloudflare Workers では `firebase-admin` の読み込み時に次のエラーが発生し、`POST /api/event` が 500 になっていた。

```text
EvalError: Code generation from strings disallowed for this context
```

ローカルの `next dev` / `next start`（Node.js）では問題なく、**Cloudflare プレビュー・本番のみ**再現する。

## 検証

- `pnpm exec opennextjs-cloudflare preview` → `POST http://localhost:8787/api/event` が 200
- ブラウザで「席決めを始める」→ `/?id=<uuid>` へ遷移し主催者 UI を表示

## 本番デプロイ時

`FIREBASE_SERVICE_ACCOUNT_JSON_B64` は引き続き Cloudflare の環境変数 / Secrets に設定すること（REST 認証で使用）。
