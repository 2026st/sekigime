import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "使い方（主催者） | 席決め",
  description: "席決めの主催者向け操作手順。リンクの種類と配布方法を説明します。",
}

function Step({
  n,
  title,
  children,
}: {
  n: number
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="bg-gray-800 rounded-2xl p-6 space-y-3">
      <h2 className="text-lg font-bold text-white flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-gray-900 font-black text-sm">
          {n}
        </span>
        {title}
      </h2>
      <div className="text-gray-300 text-sm leading-relaxed space-y-3 pl-11">{children}</div>
    </section>
  )
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-8">
        <header className="space-y-4">
          <Link
            href="/"
            className="inline-block text-yellow-400 text-sm hover:text-yellow-300 underline"
          >
            ← トップへ戻る
          </Link>
          <div>
            <h1 className="text-3xl font-black text-yellow-400">主催者の使い方</h1>
            <p className="text-gray-400 text-sm mt-2">
              席決めの準備から参加者へのリンク配布までの手順です。参加者向けの画面の流れも末尾に記載しています。
            </p>
          </div>
        </header>

        <section className="bg-amber-900/20 border border-amber-400/30 rounded-2xl px-5 py-4 space-y-3">
          <h2 className="text-amber-300 font-bold">リンクは2種類</h2>
          <dl className="text-sm space-y-3">
            <div>
              <dt className="text-yellow-400 font-bold">主催者用（自分用・ブックマーク推奨）</dt>
              <dd className="text-gray-300 mt-1 font-mono text-xs break-all">
                https://（サイトのURL）/?id=イベントID
              </dd>
              <dd className="text-gray-400 mt-1">
                「席決めを始める」のあとブラウザのアドレスバーに表示されます。参加者リストの編集・席の作成・再振り分けに使います。メンバーには送らなくて構いません。
              </dd>
            </div>
            <div>
              <dt className="text-yellow-400 font-bold">参加者用（全員に同じリンクを配布）</dt>
              <dd className="text-gray-300 mt-1 font-mono text-xs break-all">
                https://（サイトのURL）/イベントID
              </dd>
              <dd className="text-gray-400 mt-1">
                席を作成したあと、主催者画面の「参加者に配るリンク」に表示されます。LINE や Slack などで全員に同じ URL を送ってください。
              </dd>
            </div>
          </dl>
        </section>

        <div className="space-y-4">
          <h2 className="text-xl font-black text-white">はじめて使うとき</h2>

          <Step n={1} title="席決めを始める">
            <p>
              <Link href="/" className="text-yellow-400 underline hover:text-yellow-300">
                トップページ
              </Link>
              を開き、<strong className="text-white">「席決めを始める」</strong>
              を押します。イベントが作成され、主催者用の URL（
              <code className="text-gray-400">/?id=...</code>
              ）に移動します。
            </p>
            <p className="text-gray-400">
              この URL をブックマークしておくと、あとから設定を続けられます。
            </p>
          </Step>

          <Step n={2} title="参加者リストを登録する">
            <p>
              <strong className="text-white">参加者リスト</strong>
              のテキスト欄に、1行に1名ずつ名前を入力します（例: 田中洸志、山田太郎）。
            </p>
            <p>
              入力が終わったら <strong className="text-white">「保存」</strong>
              を押します。参加者名は、あとでメンバーが席を確認するときに入力する名前と
              <strong className="text-white">完全に同じ表記</strong>
              にしてください（スペースの有無や全角半角も含めて一致が必要です）。
            </p>
          </Step>

          <Step n={3} title="テーブルを設定する">
            <p>
              <strong className="text-white">テーブル設定</strong>
              で卓の数と各卓の定員（人数）を入力し、
              <strong className="text-white">「保存」</strong>します。
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-1">
              <li>「+ テーブルを追加」で卓を増やせます</li>
              <li>定員は半角数字で 1〜100</li>
              <li>参加者数が「合計定員」を超えると席は作成できません</li>
            </ul>
          </Step>

          <Step n={4} title="席を作成する">
            <p>
              参加者とテーブルの保存が終わったら、
              <strong className="text-white">「席を作成」</strong>
              を押します。ランダムに席が割り当てられ、画面下部に
              <strong className="text-white">振り分け結果</strong>が表示されます。
            </p>
            <p className="text-gray-400">
              右上のステータスが「作成済み」になれば完了です。この時点ではまだ参加者にリンクを送っていなくても構いませんが、送る前に結果を一度確認しておくと安心です。
            </p>
          </Step>

          <Step n={5} title="参加者にリンクを送る">
            <p>
              <strong className="text-white">「参加者に配るリンク」</strong>
              欄の URL（<code className="text-gray-400">/イベントID</code>
              の形式）をコピーし、参加者全員に同じリンクを送ります。
            </p>
            <p>
              <strong className="text-white">「コピー」</strong>
              ボタンでクリップボードにコピーできます。「参加者ページを開く」で、メンバーと同じ画面をプレビューできます。
            </p>
          </Step>
        </div>

        <section className="bg-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">あとから編集・再開する</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            主催者用 URL（<code className="text-gray-400">/?id=...</code>
            ）をブックマークしている場合は、そのまま開けば編集画面に戻れます。
          </p>
          <p className="text-gray-300 text-sm leading-relaxed">
            ブックマークを失くした場合は、
            <Link href="/" className="text-yellow-400 underline hover:text-yellow-300">
              トップ
            </Link>
            の <strong className="text-white">「既存の席決めを編集」</strong>
            に、参加者に送った URL（またはイベント ID だけ）を貼り付けて
            <strong className="text-white">「続ける」</strong>
            を押します。参加者用・主催者用のどちらの URL でも再開できます。
          </p>
        </section>

        <section className="bg-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">参加者・テーブルを変更したとき</h2>
          <p className="text-amber-400/90 text-sm bg-amber-900/20 border border-amber-400/30 rounded-xl px-4 py-3">
            参加者リストまたはテーブル設定を保存すると、いったん振り分けが解除されます。変更後は必ず
            <strong>「席を再作成」</strong>
            を押し直してください。
          </p>
          <ul className="text-gray-300 text-sm space-y-2 list-disc list-inside">
            <li>
              再振り分け: <strong className="text-white">「席を再作成」</strong>
              — 新しいランダム割当
            </li>
            <li>
              割当だけ取り消す: <strong className="text-white">「リセット」</strong>
              — リンク配布前にやり直すときなど
            </li>
          </ul>
        </section>

        <section className="bg-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">メンバー側の操作（参考）</h2>
          <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
            <li>主催者から受け取ったリンク（<code className="text-gray-400">/イベントID</code>）を開く</li>
            <li>登録されている自分の名前を入力する</li>
            <li>「席を確認する！」を押す</li>
            <li>封筒のアニメーションで卓番号が表示される</li>
          </ol>
          <p className="text-gray-400 text-sm">
            席がまだ作成されていないときは「まだ席が決まっていません」と表示されます。主催者が「席を作成」するまで待ってもらってください。
          </p>
        </section>

        <section className="bg-gray-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-bold text-white">よくあるトラブル</h2>
          <dl className="text-sm space-y-4">
            <div>
              <dt className="text-white font-bold">「名前が見つかりませんでした」</dt>
              <dd className="text-gray-400 mt-1">
                参加者が入力した名前が、主催者が保存したリストと一致していません。スペル・スペース・全角半角を揃えて、リストを修正して保存 → 席を再作成してください。
              </dd>
            </div>
            <div>
              <dt className="text-white font-bold">「参加者数が合計定員を超えています」</dt>
              <dd className="text-gray-400 mt-1">
                テーブルの定員合計を増やすか、参加者リストから人数を減らしてください。
              </dd>
            </div>
            <div>
              <dt className="text-white font-bold">「イベントが見つかりません」</dt>
              <dd className="text-gray-400 mt-1">
                URL が古い・誤っている可能性があります。主催者画面の参加者リンクを再度コピーして配布してください。
              </dd>
            </div>
          </dl>
        </section>

        <div className="text-center pb-8">
          <Link
            href="/"
            className="inline-block bg-yellow-400 text-gray-900 font-black text-lg px-8 py-4 rounded-2xl hover:bg-yellow-300 transition-colors"
          >
            席決めを始める
          </Link>
        </div>
      </div>
    </div>
  )
}
