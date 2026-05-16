# ホーム統合 + UUID 参加者リンク 実装メモ

## 意図

主催者の操作をトップページに集約し、席作成後にイベント固有の URL を配布できるようにする。参加者は全員同じリンクから名前入力で自分の席だけを確認する（従来の `/` の挙動を `/{uuid}` に移した）。

## URL 例

| 用途 | URL |
|------|-----|
| 新規開始 | `https://example.com/` |
| 主催者設定 | `https://example.com/?id=550e8400-e29b-41d4-a716-446655440000` |
| 参加者（配布） | `https://example.com/550e8400-e29b-41d4-a716-446655440000` |

## データ保存

- KV キー: `event:{uuid}`
- ローカル（KV 未設定）: `Map<string, EventData>`

## 主な変更ファイル

- `src/lib/kv.ts` — マルチイベント、`createEvent`, `isValidEventId`
- `src/app/api/event/route.ts` — POST 追加、GET/PUT に `eventId`
- `src/app/page.tsx` — 主催者 UI
- `src/app/[eventId]/page.tsx` — 参加者 UI
- `src/components/OrganizerSetup.tsx`, `ParticipantSeatView.tsx`

## API 変更一覧

- `POST /api/event` — 作成
- `GET|PUT /api/event?eventId=` — 取得・更新
- `POST /api/assign?eventId=` — 振り分け
- `GET /api/seat?eventId=&name=` — 席照会
