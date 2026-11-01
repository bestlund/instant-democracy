import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { User, X } from 'lucide-react'

// Shared building blocks. One black primary action per screen, everything
// else white or quiet grey (D1).

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ')
}

/** Screen layout: fixed header and footer, scrolling content in between. */
export function Screen({
  header,
  footer,
  children,
  overlay,
}: {
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
  overlay?: ReactNode
}) {
  return (
    <div className="absolute inset-0 flex flex-col bg-canvas">
      {header && <div className="shrink-0 px-5 pt-[calc(var(--safe-top)+8px)]">{header}</div>}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      {footer && <div className="shrink-0 px-5 pb-[calc(var(--safe-bottom)+14px)] pt-3">{footer}</div>}
      {overlay}
    </div>
  )
}

export function IconButton({
  label,
  children,
  badge,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; badge?: number }) {
  return (
    <button
      type="button"
      aria-label={badge ? `${label}, ${badge} new` : label}
      className={cx(
        'relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-card text-ink border border-line shadow-card transition active:scale-95',
        className,
      )}
      {...rest}
    >
      {children}
      {!!badge && (
        <span className="absolute -right-0.5 -top-0.5 grid h-[20px] min-w-[20px] place-items-center rounded-full border-2 border-canvas bg-ink px-1 text-[11px] font-semibold leading-none text-white">
          {badge}
        </span>
      )}
    </button>
  )
}

export function PrimaryButton({ children, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cx(
        'flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink text-[17px] font-medium text-white transition active:scale-[0.98] active:bg-ink-soft',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({ children, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cx(
        'flex h-14 w-full items-center justify-center gap-2 rounded-full bg-card text-[17px] font-medium text-ink border border-line shadow-card transition active:scale-[0.98]',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Chip({ children, solid = false }: { children: ReactNode; solid?: boolean }) {
  return (
    <span
      className={cx(
        'inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium',
        solid ? 'bg-ink text-white' : 'border border-line bg-card text-ink',
      )}
    >
      {children}
    </span>
  )
}

export function Avatar({
  name,
  size = 32,
  dim = false,
  ring = false,
  anonymous = false,
}: {
  name: string
  size?: number
  dim?: boolean
  ring?: boolean
  anonymous?: boolean
}) {
  // The current user gets an outlined avatar with a person icon, so "you"
  // stands out in a row of other people's initials.
  const me = name === 'You'
  return (
    <span
      aria-hidden="true"
      className={cx(
        'grid shrink-0 place-items-center rounded-full font-semibold',
        dim
          ? 'border border-dashed border-muted bg-card text-muted'
          : me
            ? 'border-[1.5px] border-ink bg-card text-ink'
            : 'bg-ink text-white',
        ring && 'ring-2 ring-canvas',
      )}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {me ? <User size={size * 0.52} strokeWidth={2} /> : anonymous ? '?' : name.slice(0, 1).toUpperCase()}
    </span>
  )
}

export function AvatarStack({ names, max = 4 }: { names: string[]; max?: number }) {
  const shown = names.slice(0, max)
  const rest = names.length - shown.length
  return (
    <span className="flex -space-x-2">
      {shown.map((n, i) => (
        <Avatar key={i} name={n} ring />
      ))}
      {rest > 0 && (
        <span className="grid h-8 min-w-8 place-items-center rounded-full bg-fill px-2 text-[12px] font-semibold text-ink ring-2 ring-canvas">
          +{rest}
        </span>
      )}
    </span>
  )
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: ReactNode }[]
  label: string
}) {
  return (
    <div role="tablist" aria-label={label} className="flex rounded-full bg-fill p-1">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cx(
              'flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full text-[15px] font-medium transition',
              active ? 'bg-card text-ink ring-1 ring-line' : 'text-muted',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/** Bottom sheet inside the phone screen. */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div className={cx('absolute inset-0 z-30', !open && 'pointer-events-none')} aria-hidden={!open}>
      <div
        className={cx('absolute inset-0 bg-ink/30 transition-opacity duration-200', open ? 'opacity-100' : 'opacity-0')}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          'absolute inset-x-0 bottom-0 rounded-t-[28px] bg-canvas px-5 pb-[calc(var(--safe-bottom)+16px)] pt-3 shadow-sheet transition-transform duration-300 ease-out',
          open ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[20px] font-semibold">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <X size={20} strokeWidth={1.8} aria-hidden="true" />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  )
}

/** Row used in sheets and lists: icon tile, title, description. */
export function ActionRow({
  icon,
  title,
  description,
  onClick,
}: {
  icon: ReactNode
  title: string
  description?: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-card bg-card p-4 text-left border border-line shadow-card transition active:scale-[0.99]"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ink text-white">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[17px] font-semibold">{title}</span>
        {description && <span className="block text-[14px] text-muted">{description}</span>}
      </span>
    </button>
  )
}
