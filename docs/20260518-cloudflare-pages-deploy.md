# Cloudflare Pages デプロイ手順（Firestore）

## 重要（デプロイ失敗時）

Cloudflare の **Build command を `pnpm run build` のままにしないこと**。それは `next build` のみで、**OpenNext のアダプトが走らない**ため、デプロイで次のように失敗する。

`ERROR Could not find compiled Open Next config, did you run the build command?`

**推奨ビルドコマンド**（`package.json` の npm スクリプトに依存しない。古いブランチや未 push でも動く）:

```text
pnpm install && pnpm exec opennextjs-cloudflare build
```

**代替**（リポジトリに `build:cloudflare` スクリプトが入っている場合のみ）:

```text
pnpm install && pnpm run build:cloudflare
```

`ERR_PNPM_NO_SCRIPT Missing script: build:cloudflare` と出る場合は、**まだ `build:cloudflare` が push されていない**か、**別ブランチをビルドしている**状態です。上記の **`pnpm exec opennextjs-cloudflare build`** に切り替えてください。

デプロイ（Deploy command）は `npx wrangler deploy` のままでよい（OpenNext 検出後に処理される）。

## 概要



Next.js 16（App Router + API Routes）を [@opennextjs/cloudflare](https://opennext.js.org/cloudflare) 経由で Cloudflare にデプロイする。



- **ビルド**: `opennextjs-cloudflare build`（内部で `next build` を実行）

- **成果物**: `.open-next/worker.js` + `.open-next/assets`

- **データベース**: **Cloud Firestore**（サーバーは Firebase Admin SDK）。クライアントから Firestore へは直読み書きしない（[`firestore.rules`](firestore.rules) は全面拒否）



### MCP について



- **Cloudflare MCP** には `wrangler deploy` 相当のデプロイ用ツールは含まれない。**本番反映は Wrangler または本リポジトリの GitHub Actions** が本体。

- **Firebase MCP** は `firebase_init` / `firebase_deploy` で **ルール・インデックス** などをデプロイできる。利用前に Firebase CLI ログイン（MCP の `firebase_login` またはローカルで `firebase login`）が必要。

  - **グローバルに `firebase` が無い場合**（PowerShell で「名前として認識されない」）: `pnpm dlx firebase-tools login` または `npx firebase-tools@latest login` を使う。

- Next アプリ本体のホスティングは **Firebase Hosting ではなく Cloudflare** のまま。



## Firebase（初回）



1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成し、**Firestore** を有効化する。

2. プロジェクト設定 → サービスアカウント → **新しい秘密鍵の生成** → JSON をダウンロード。

3. JSON ファイルを **Base64** 化した文字列を `FIREBASE_SERVICE_ACCOUNT_JSON_B64` として Cloudflare（および CI Secrets）に登録する。

   - PowerShell 例: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("path\to\key.json"))`

4. `.firebaserc.example` を `.firebaserc` にコピーし、`YOUR_FIREBASE_PROJECT_ID` を差し替える。

5. ルール・インデックスの反映（ログイン済みならプロジェクトルートで）:

   ```bash
   pnpm run firebase:deploy-firestore
   ```

   初回だけ `.firebaserc` が無い場合は `.firebaserc.example` をコピーしてプロジェクト ID を入れるか、`pnpm exec firebase use --add` で紐づける。

   または Firebase MCP の `firebase_deploy`（`only: firestore`）。



コレクションは **`events`**、ドキュメント ID はイベント UUID。フィールドは [`EventData`](src/lib/types.ts) と同名。



## ローカル開発



```bash

pnpm dev          # Next.js 開発サーバー

pnpm preview      # Cloudflare Workers ランタイムで本番ビルドを確認

```



`.dev.vars.example` を `.dev.vars` にコピーし、必要なら `FIREBASE_SERVICE_ACCOUNT_JSON_B64` を設定。未設定時は [`src/lib/kv.ts`](src/lib/kv.ts) がインメモリにフォールバックする。



## 手動デプロイ（CLI）



```bash

pnpm exec wrangler login   # 初回のみ

pnpm run deploy            # または pnpm run deploy:pages

```



Windows では OpenNext のシンボリックリンク制限により `opennextjs-cloudflare build` が失敗することがある。**WSL / Linux / GitHub Actions** でのビルドを推奨する。



## Cloudflare ダッシュボード（Git 連携）



1. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**

2. ビルド設定:

   - **Framework preset**: None

   - **Build command**: `pnpm install && pnpm exec opennextjs-cloudflare build`（**推奨**。※ `pnpm run build:cloudflare` は最新の `package.json` がデプロイブランチに含まれる場合のみ可）

   - **Build output directory**: 空欄（`wrangler.jsonc` をソースとして利用）

   - **Deploy command**: `npx wrangler deploy`（既定のまま）

3. **環境変数**（本番）:

   - `FIREBASE_SERVICE_ACCOUNT_JSON_B64`



## GitHub Actions



`.github/workflows/cloudflare-pages.yml` が `main` への push で `opennextjs-cloudflare deploy -- --keep-vars` を実行する。



| Secret | 用途 |

|--------|------|

| `CLOUDFLARE_API_TOKEN` | デプロイ用 API トークン |

| `CLOUDFLARE_ACCOUNT_ID` | アカウント ID |

| `FIREBASE_SERVICE_ACCOUNT_JSON_B64` | ビルド時に Next が参照するシークレット向け（任意だが推奨。ランタイムも Cloudflare に同じ変数を設定） |



## Vercel / Redis からの移行メモ



- 永続化は **Upstash / `KV_REST_*` ではなく Firestore**。

- 既存 Redis のデータ移行が必要な場合は別途ワンショットスクリプトを検討する。


