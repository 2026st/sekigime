# KV未設定時フォールバック機能 仕様書

## 1. 目的

- ローカル開発環境で `KV_REST_API_URL` / `KV_REST_API_TOKEN` が未設定でも、座席割り当て関連APIが500で停止しないようにする。
- 本番環境では従来どおり `@vercel/kv` を利用し、既存挙動との互換性を維持する。

具体例:
- 例1: `.env` 未設定で `GET /api/seat?name=Tanaka` を実行しても、500ではなく業務上妥当なレスポンス（404など）を返す。
- 例2: 本番でKV環境変数が設定済みの場合、保存先は引き続きVercel KVとなる。

## 2. 対象範囲

- 対象モジュール: `src/lib/kv.ts`
- 対象関数:
  - `getEvent(): Promise<EventData>`
  - `setEvent(data: EventData): Promise<void>`
- 非対象:
  - APIのURL設計変更
  - 永続ストレージ追加（DB導入など）
  - クライアント側UI変更

## 3. 用語定義

- `KV有効`: `KV_REST_API_URL` と `KV_REST_API_TOKEN` の両方が設定されている状態。
- `KV無効`: 上記いずれかが未設定の状態。
- `メモリフォールバック`: サーバープロセス内変数 `memoryEvent` を保存先として利用する動作。

## 4. 機能仕様

### 4.1 フォールバック判定

- 判定条件は `hasKvEnv = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)` とする。
- `hasKvEnv === true` の場合はKVを利用する。
- `hasKvEnv === false` の場合はメモリフォールバックを利用する。

### 4.2 取得処理（`getEvent`）

- KV有効時:
  - `kv.get<EventData>("event")` を実行。
  - 取得値が `null`/`undefined` の場合は `DEFAULT_EVENT` を返す。
- KV無効時:
  - `memoryEvent` が存在すればそれを返す。
  - 未設定時は `DEFAULT_EVENT` を返す。
- 戻り値は常に `cloneEvent()` を経由し、参照共有を避ける。

具体例:
- 例1: KV無効かつ初回アクセス時、`DEFAULT_EVENT` のコピーを返却する。
- 例2: KV有効だが `event` キー未作成時、`DEFAULT_EVENT` のコピーを返却する。

### 4.3 保存処理（`setEvent`）

- KV有効時:
  - `kv.set("event", data)` を実行。
- KV無効時:
  - `memoryEvent = cloneEvent(data)` としてプロセス内へ保存。
- 入力 `data` は保存時に `cloneEvent()` を経由し、外部参照の副作用を防止する。

具体例:
- 例1: KV無効環境で `setEvent` 後に `getEvent` すると、同一内容が返る。
- 例2: `setEvent` 後に呼び出し元で `data.participants.push(...)` しても、保存済みデータは影響を受けない。

## 5. 非機能仕様

### 5.1 信頼性

- KV未設定時でもAPIが500で失敗しないこと。
- フォールバック時のデータはプロセス再起動で消失してよい（開発用途想定）。

### 5.2 セキュリティ

- APIキーやトークンはコードへハードコードしない。環境変数経由のみ許可。
- 本機能追加による攻撃面の増加は限定的で、想定CVSSは `0.0 - 3.9`（Low）に収める設計とする。

### 5.3 保守性

- 既存公開インターフェース（関数シグネチャ）を維持し、呼び出し側変更を不要にする。
- 分岐条件は単一の `hasKvEnv` に集約し、重複を防ぐ。

## 6. 受け入れ条件

- 条件1: KV環境変数未設定で `GET /api/seat?name=<任意>` 実行時、500を返さない。
- 条件2: KV環境変数設定済み環境で、従来どおりKVに対して読取/書込される。
- 条件3: `getEvent` / `setEvent` の外部インターフェースに変更がない。
- 条件4: `DEFAULT_EVENT` や保存データが外部から直接ミューテートされない（クローンで防止）。

## 7. 制約事項

- メモリフォールバックは単一プロセス内のみ有効で、マルチインスタンス間の整合性は保証しない。
- 永続化要件がある環境では必ずKVを有効化する。

## 8. 運用メモ

- ローカル開発:
  - KV環境変数なしでも基本動作確認が可能。
- 本番/検証環境:
  - `KV_REST_API_URL` と `KV_REST_API_TOKEN` を必須設定とする。
