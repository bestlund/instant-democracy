import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

// Small message at the bottom of the screen. Used for actions that aren't
// built yet in this iteration, so testers get feedback instead of a dead tap.

const ToastContext = createContext<(text: string) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [text, setText] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const show = useCallback((t: string) => {
    setText(t)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setText(null), 2400)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={
          'pointer-events-none absolute inset-x-0 bottom-[calc(var(--safe-bottom)+96px)] z-40 flex justify-center px-6 transition duration-200 ' +
          (text ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0')
        }
      >
        {text && (
          <span className="rounded-full bg-ink px-5 py-3 text-[15px] font-medium text-white shadow-sheet">{text}</span>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
