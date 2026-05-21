# Vercel デプロイ

**日付**: 2026-05-21

## 目的

Cloudflare（OpenNext）と並行して、標準の **Next.js ビルド**（`pnpm run build`）で Vercel にホストできるようにする。データ層は **Firebase Web SDK**（`NEXT_PUBLIC_FIREBASE_*`）で Firestore に直結する。

## 設定ファイル

| ファイル | 役割 |
|----------|------|
| [`vercel.json`](../vercel.json) | `pnpm install` / `pnpm run build` を明示 |
| [`.env.example`](../.env.example) | 必須環境変数の雛形 |
| [`next.config.ts`](../next.config.ts) | `VERCEL` 上では OpenNext の dev 初期化をスキップ |

## 環境変数

Vercel プロジェクト → **Settings → Environment Variables** に以下を設定（Production / Preview 推奨）。

| 名前 | 説明 |
|------|------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` など | [`.env.example`](../.env.example) 参照。詳細は [20260521-firebase-sdk.md](20260521-firebase-sdk.md) |

Cloudflare と同じ値を流用できる。

## デプロイ手順

### Git 連携（推奨）

1. [Vercel](https://vercel.com/new) でリポジトリを Import
2. Framework Preset: **Next.js**（自動検出）
3. 上記環境変数を登録
4. Deploy

ビルドコマンドは `vercel.json` の `pnpm run build` が使われる。

### CLI

```bash
pnpm add -g vercel   # 未導入時
vercel link
vercel env pull .env.local   # 任意
vercel deploy --prod
```

## Cloudflare との違い

| 項目 | Vercel | Cloudflare |
|------|--------|------------|
| ビルド | `next build` | `opennextjs-cloudflare build` |
| 設定 | `vercel.json` | `wrangler.jsonc` + OpenNext |
| CI 例 | Vercel Git 連携 | [`.github/workflows/cloudflare-pages.yml`](../.github/workflows/cloudflare-pages.yml) |

両方に同じ `NEXT_PUBLIC_FIREBASE_*` を設定すれば、イベントデータは Firestore で共有できる。

## 検証

```bash
pnpm run build
# または
pnpm run build:vercel
```

ローカルで Firestore を使う場合は `.env.local` に `NEXT_PUBLIC_FIREBASE_*` を設定して `pnpm dev`。
