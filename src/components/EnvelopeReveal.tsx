"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"

type OpenState = "sealed" | "opening" | "opened"

/** 洋形2号（ダイヤモンド貼）: 162 × 114、フラップ 69 */
const W = 280
const BODY_H = Math.round((W * 114) / 162)
const FLAP_H = Math.round((BODY_H * 69) / 114)
const CX = W / 2
const CY = BODY_H / 2
const LETTER_W = W - 56
const DISPLAY_H = BODY_H + FLAP_H

const easeOut = [0.22, 1, 0.36, 1] as const

const COLORS = {
  body: "#d4b896",
  topFlap: "#e8d4b8",
  side: "#b89868",
  bottom: "#c9a86c",
  stroke: "#9a7a4a",
} as const

type Props = {
  tableId: number
  participantName: string
  onOpened: () => void
  onReset: () => void
}

export function EnvelopeReveal({
  tableId,
  participantName,
  onOpened,
  onReset,
}: Props) {
  const [openState, setOpenState] = useState<OpenState>("sealed")
  const openedFired = useRef(false)

  const handleTap = () => {
    if (openState !== "sealed") return
    setOpenState("opening")
  }

  useEffect(() => {
    if (openState !== "opening") return
    const t = setTimeout(() => setOpenState("opened"), 1100)
    return () => clearTimeout(t)
  }, [openState])

  useEffect(() => {
    if (openState !== "opened" || openedFired.current) return
    openedFired.current = true
    onOpened()
  }, [openState, onOpened])

  const isSealed = openState === "sealed"
  const isOpening = openState === "opening"
  const isOpened = openState === "opened"
  const isAnimating = isOpening || isOpened
  const flapOpen = !isSealed

  return (
    <div className="flex flex-col items-center w-full max-w-sm">
      <p className="text-white text-xl mb-6 text-center">
        <span className="text-yellow-400 font-bold">{participantName}</span>
        さん、封筒を開けて席を確認！
      </p>

      <motion.div
        animate={isSealed ? { y: [0, -8, 0] } : { y: 0 }}
        transition={
          isSealed
            ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.3 }
        }
        className="relative mx-auto"
        style={{ width: W, height: DISPLAY_H }}
      >
        <div
          className="relative overflow-visible"
          style={{
            width: W,
            height: DISPLAY_H,
            perspective: 800,
            transformStyle: "preserve-3d",
          }}
        >
          {/* 下・左・右フラップ（SVG） */}
          <svg
            width={W}
            height={BODY_H}
            viewBox={`0 0 ${W} ${BODY_H}`}
            className="absolute left-0 overflow-visible"
            style={{ top: FLAP_H, zIndex: 1 }}
            aria-hidden
          >
            <rect
              x={1}
              y={1}
              width={W - 2}
              height={BODY_H - 2}
              rx={3}
              fill={COLORS.body}
            />
            <polygon
              points={`1,${BODY_H - 1} ${W - 1},${BODY_H - 1} ${CX},${CY}`}
              fill={COLORS.bottom}
            />
            <polygon
              points={`1,1 1,${BODY_H - 1} ${CX},${CY}`}
              fill={COLORS.side}
            />
            <polygon
              points={`${W - 1},1 ${W - 1},${BODY_H - 1} ${CX},${CY}`}
              fill={COLORS.side}
            />
            {/* 開封後: 上辺の折り目（ヒンジライン） */}
            <line
              x1={1}
              y1={1}
              x2={W - 1}
              y2={1}
              stroke={COLORS.stroke}
              strokeWidth={1}
              opacity={flapOpen ? 1 : 0}
            />
          </svg>

          {/* 開封後: 上フラップ（底辺＝天地 y=FLAP_H にぴったり接続） */}
          <motion.div
            initial={false}
            animate={{
              opacity: flapOpen ? 1 : 0,
            }}
            transition={{ duration: 0.35, ease: easeOut }}
            className="absolute left-0 pointer-events-none"
            style={{
              top: 0,
              width: W,
              height: FLAP_H,
              zIndex: 2,
              clipPath: "polygon(0 100%, 100% 100%, 50% 0%)",
              background: `linear-gradient(0deg, ${COLORS.topFlap} 0%, #f0e0c8 100%)`,
            }}
            aria-hidden={!flapOpen}
          />

          {/* 未開封: 上フラップ（頂点＝中央、天地をヒンジに下向き） */}
          <motion.div
            initial={false}
            animate={{
              rotateX: flapOpen ? 90 : 0,
              opacity: flapOpen ? 0 : 1,
            }}
            transition={{ duration: 0.7, ease: easeOut }}
            className="absolute left-0 pointer-events-none"
            style={{
              top: FLAP_H,
              width: W,
              height: CY,
              transformOrigin: "50% 0%",
              transformStyle: "preserve-3d",
              zIndex: 6,
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              background: `linear-gradient(180deg, ${COLORS.topFlap} 0%, #e0d0b0 100%)`,
            }}
            aria-hidden={flapOpen}
          />

          {/* 紙 */}
          <motion.div
            initial={false}
            animate={{
              y: isSealed ? CY * 0.35 : isOpening ? -FLAP_H * 0.55 : -FLAP_H - 28,
              opacity: isSealed ? 0 : 1,
              rotate: isOpened ? -2 : isOpening ? -4 : 0,
            }}
            transition={{
              y: {
                duration: 0.85,
                ease: easeOut,
                delay: isAnimating ? 0.35 : 0,
              },
              opacity: { duration: 0.25, delay: isAnimating ? 0.3 : 0 },
              rotate: { duration: 0.5 },
            }}
            className="absolute left-1/2 -translate-x-1/2 rounded-sm border border-[#e0cfa8] bg-gradient-to-b from-[#fffef8] to-[#f5e6c8] shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
            style={{
              top: FLAP_H,
              width: LETTER_W,
              minHeight: 100,
              zIndex: isOpened ? 12 : 3,
            }}
          >
            <div className="px-3 py-5 text-center min-h-[92px] flex flex-col justify-center">
              {isOpened && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, duration: 0.35 }}
                >
                  <p className="text-[#8b7355] text-xs font-bold tracking-widest mb-2">
                    あなたの席
                  </p>
                  <p className="text-6xl font-black text-[#5c4033] leading-none">
                    {tableId}
                  </p>
                  <p className="text-lg font-bold text-[#6b5344] mt-2">
                    番テーブル
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* ワックスシール */}
          <motion.div
            initial={false}
            animate={{
              scale: isSealed ? 1 : 0,
              opacity: isSealed ? 1 : 0,
            }}
            transition={{ duration: 0.22, ease: "easeIn" }}
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full bg-gradient-to-br from-[#8b2942] to-[#5c1a2e] border-2 border-[#a03050] shadow-lg pointer-events-none"
            style={{
              width: 48,
              height: 48,
              top: FLAP_H + CY - 24,
              zIndex: flapOpen ? 3 : 7,
            }}
          >
            <span className="text-[#ffd700] text-sm font-black">席</span>
          </motion.div>

          {isSealed && (
            <button
              type="button"
              onClick={handleTap}
              aria-label="封筒を開封する"
              className="absolute z-20 cursor-pointer rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
              style={{ top: FLAP_H, left: 0, width: W, height: BODY_H }}
            />
          )}
        </div>
      </motion.div>

      {isSealed && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mt-4 text-yellow-400/90 text-sm font-bold"
        >
          封筒をタップして開封
        </motion.p>
      )}

      {isOpened && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-6 text-center space-y-4 w-full"
        >
          <p className="text-gray-300 text-lg font-bold">へどうぞ！</p>
          <button
            type="button"
            onClick={onReset}
            className="text-gray-300 hover:text-white text-sm underline transition-colors"
          >
            別の名前を検索する
          </button>
        </motion.div>
      )}
    </div>
  )
}
