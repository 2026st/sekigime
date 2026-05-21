# Firebase Web SDK 直結（Firestore）

**日付**: 2026-05-21

## 目的

ブラウザから **Firebase JS SDK** で Cloud Firestore に直接 read/write する。Next.js API Routes とサービスアカウント（REST）は廃止。

## Firebase プロジェクト

| 項目 | 値 |
|------|-----|
| 表示名 | sekigime |
| プロジェクト ID | `sekigime-858f6` |
| `.firebaserc` | `default: sekigime-858f6` |

## セットアップ手順

### 1. Web アプリを Firebase に登録（未作成の場合）

1. [Firebase Console](https://console.firebase.google.com/) → **sekigime** → プロジェクトの設定
2. **マイアプリ** → **Web**（`</>`）→ アプリ名 `sekigime-web` などで追加
3. 表示される `firebaseConfig` の値をコピー

### 2. 環境変数

[`.env.example`](../.env.example) を `.env.local` にコピーし、Console の値を入れる。

| 変数 | 例 |
|------|-----|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIza...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `sekigime-858f6.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `sekigime-858f6` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `sekigime-858f6.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | 数字 |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:830164582692:web:...` |

Vercel / Cloudflare にも同じ `NEXT_PUBLIC_*` を **Production / Preview** に設定する。

### 3. Firestore ルールのデプロイ

```bash
pnpm run firebase:deploy-firestore
```

[`firestore.rules`](../firestore.rules): `events/{uuid}` のみ read/create/update 可（UUID 形式のみ）。delete 不可。

### 4. ローカル確認

```bash
pnpm dev
```

「席決めを始める」→ Firestore の `events` にドキュメントが増えること。

既存イベントの再開・再振り分けは [`docs/20260521-home-resume.md`](20260521-home-resume.md) を参照。

## コード構成

| ファイル | 役割 |
|----------|------|
| [`src/lib/firebase/config.ts`](../src/lib/firebase/config.ts) | `initializeApp` / `getFirestore` |
| [`src/lib/firebase/events.ts`](../src/lib/firebase/events.ts) | `getEvent` / `setEvent` / `createEvent` |
| [`src/app/page.tsx`](../src/app/page.tsx) | イベント作成 |
| [`src/components/OrganizerSetup.tsx`](../src/components/OrganizerSetup.tsx) | 主催者 UI |
| [`src/components/ParticipantSeatView.tsx`](../src/components/ParticipantSeatView.tsx) | 参加者の席確認 |

`NEXT_PUBLIC_*` 未設定時はインメモリにフォールバック（再起動で消える）。

## セキュリティ

- API キーはクライアント公開前提。Firestore ルールで UUID パスのみ許可。
- イベント ID を知る人は読み書き可能（リンク共有型アプリの想定）。
- 本番では Firebase Console → **API キーの制限**（HTTP リファラー）を推奨。

## 廃止したもの

- `FIREBASE_SERVICE_ACCOUNT_JSON_B64`
- `/api/event`, `/api/assign`, `/api/seat`
- `src/lib/kv.ts`, `src/lib/firestore-rest.ts`
