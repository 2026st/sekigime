# 封筒アニメーション再設計（プラン）

## 意図

抽象 SVG が中央で交差する菱形になり封筒に見えなかった。初心に戻り「封筒が開き、中から席番号の紙が出る」体験を CSS レイヤーで再現する。

## 選択理由

- **SVG 複数ポリゴンを廃止**: 左・右・前ポケットがすべて中央へ向かう設計がダイヤ型の原因
- **CSS レイヤー + clip-path**: 上フラップ1枚・下ポケット1枚に限定し誰でも封筒と認識できる
- **Framer Motion 維持**: 既存の `sealed → opening → opened` と Confetti 連携をそのまま利用

## 実装概要

[`EnvelopeReveal.tsx`](../src/components/EnvelopeReveal.tsx) を全面差し替え。詳細は [`docs/20260521-envelope-animation.md`](../docs/20260521-envelope-animation.md) を参照。

## 成功基準

1. 未開封時に「茶色の封筒」と説明できる
2. タップで上蓋が開き、白い紙がせり出す
3. 紙に席番号が表示され Confetti が発火する
