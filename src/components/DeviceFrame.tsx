import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import { useStore } from '../data/store'
import { ToastProvider } from './Toast'

// The prototype is mobile only (D2). On a phone it fills the screen.
// On a laptop it renders inside an iPhone frame so testers and teachers
// see it at real phone size, and the facilitator gets a reset button.

const SCREEN_W = 390
const SCREEN_H = 844
const BEZEL = 14
const FRAME_W = SCREEN_W + BEZEL * 2
const FRAME_H = SCREEN_H + BEZEL * 2

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatches(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return matches
}

function useFitScale(height: number) {
  const calc = () => Math.min(1, (window.innerHeight - 48) / height)
  const [scale, setScale] = useState(calc)
  useEffect(() => {
    const on = () => setScale(calc())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  })
  return scale
}

function useClock() {
  const fmt = () =>
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(Date.now())
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const id = window.setInterval(() => setTime(fmt()), 15_000)
    return () => window.clearInterval(id)
  }, [])
  return time
}

function StatusBar() {
  const time = useClock()
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-50 flex h-[54px] items-center justify-between px-8 pt-1 text-[16px] font-semibold text-ink"
    >
      <span className="w-[54px] text-center">{time}</span>
      <span className="flex items-center gap-[6px]">
        <svg width="18" height="12" viewBox="0 0 18 12">
          <rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="currentColor" />
          <rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor" />
          <rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12">
          <path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0L8 11.5Z" fill="currentColor" />
          <path d="M3.4 6.8a6.5 6.5 0 0 1 9.2 0l-1.2 1.2a4.8 4.8 0 0 0-6.8 0L3.4 6.8Z" fill="currentColor" />
          <path d="M1.2 4.6a9.6 9.6 0 0 1 13.6 0l-1.2 1.2a7.9 7.9 0 0 0-11.2 0L1.2 4.6Z" fill="currentColor" />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="17" height="9" rx="2" fill="currentColor" />
          <path d="M25 4.5v4a2 2 0 0 0 0-4Z" fill="currentColor" opacity="0.5" />
        </svg>
      </span>
    </div>
  )
}

function PhoneSvg() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{ left: -3, top: 0 }}
      width={FRAME_W + 6}
      height={FRAME_H}
      viewBox={`-3 0 ${FRAME_W + 6} ${FRAME_H}`}
    >
      {/* side buttons */}
      <rect x="-3" y="150" width="4" height="32" rx="2" fill="#1C1C1E" />
      <rect x="-3" y="212" width="4" height="62" rx="2" fill="#1C1C1E" />
      <rect x="-3" y="288" width="4" height="62" rx="2" fill="#1C1C1E" />
      <rect x={FRAME_W - 1} y="246" width="4" height="98" rx="2" fill="#1C1C1E" />
      {/* body */}
      <rect x="0" y="0" width={FRAME_W} height={FRAME_H} rx="64" fill="#111113" />
      <rect x="2.5" y="2.5" width={FRAME_W - 5} height={FRAME_H - 5} rx="61.5" fill="none" stroke="#34343A" strokeWidth="1.5" />
      {/* screen cut-out is drawn by the screen div on top */}
    </svg>
  )
}

function ResetButton({ dark = false }: { dark?: boolean }) {
  const { dispatch } = useStore()
  return (
    <button
      type="button"
      onClick={() => {
        dispatch({ type: 'reset' })
        window.location.hash = '#/'
      }}
      className={
        'inline-flex h-11 items-center gap-2 rounded-full px-5 text-[15px] font-medium transition active:scale-[0.98] ' +
        (dark ? 'bg-ink text-white' : 'bg-white text-ink shadow-card')
      }
    >
      <RotateCcw size={18} strokeWidth={1.8} aria-hidden="true" />
      Reset demo
    </button>
  )
}

export function DeviceFrame({ children }: { children: ReactNode }) {
  const framed = useMediaQuery('(min-width: 640px)')
  const scale = useFitScale(FRAME_H)

  if (!framed) {
    return (
      <div
        className="relative h-[100dvh] w-full overflow-hidden bg-canvas"
        style={
          {
            '--safe-top': 'max(env(safe-area-inset-top), 12px)',
            '--safe-bottom': 'env(safe-area-inset-bottom)',
          } as CSSProperties
        }
      >
        <ToastProvider>{children}</ToastProvider>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center gap-16 bg-[#E4E4E7] p-6">
      <div style={{ width: FRAME_W * scale, height: FRAME_H * scale }} className="shrink-0">
        <div
          className="relative"
          style={{ width: FRAME_W, height: FRAME_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
          <PhoneSvg />
          <div
            className="absolute overflow-hidden bg-canvas"
            style={
              {
                left: BEZEL,
                top: BEZEL,
                width: SCREEN_W,
                height: SCREEN_H,
                borderRadius: 50,
                '--safe-top': '54px',
                '--safe-bottom': '22px',
              } as CSSProperties
            }
          >
            <ToastProvider>{children}</ToastProvider>
            <StatusBar />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[11px] z-50 h-[35px] w-[122px] -translate-x-1/2 rounded-full bg-black"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-2 left-1/2 z-50 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-ink"
            />
          </div>
        </div>
      </div>

      <aside className="hidden max-w-[300px] flex-col gap-5 lg:flex">
        <div>
          <p className="inline-flex gap-3 rounded-lg bg-fill px-2.5 py-1 text-[13px] font-medium uppercase tracking-[0.14em] text-muted">
            <span>Prototype v3</span>
            <span>1 Nov 2026</span>
          </p>
          <h1 className="mt-3 text-[34px] font-bold leading-[1.05] tracking-tight">Instant Democracy</h1>
        </div>
        <div>
          <ResetButton />
          <p className="mt-2 text-[13px] text-muted">Clears votes and comments between test sessions.</p>
        </div>
      </aside>
    </div>
  )
}
