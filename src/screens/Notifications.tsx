import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BellOff } from 'lucide-react'
import { useStore } from '../data/store'
import type { AppNotification } from '../data/types'
import { IconButton, Screen, cx } from '../components/ui'
import { GroupIconGlyph } from '../components/GroupIcon'
import { ago } from '../lib/time'

// The bell (D4): one place that collects every notification across groups.
// This is the idea testers liked in the second home screen (Duarte: "I see
// what is the most important thing I have to do"), without filling Home.

export default function Notifications() {
  const { state, dispatch } = useStore()
  const navigate = useNavigate()

  const sorted = [...state.notifications].sort((a, b) => b.at - a.at)
  const fresh = sorted.filter((n) => !n.read)
  const earlier = sorted.filter((n) => n.read)

  const open = (n: AppNotification) => {
    if (n.threadId) {
      dispatch({ type: 'seenThread', threadId: n.threadId })
      navigate(`/g/${n.groupId}/t/${n.threadId}`)
    } else {
      navigate(`/g/${n.groupId}`)
    }
  }

  const Row = ({ n }: { n: AppNotification }) => {
    const group = state.groups.find((g) => g.id === n.groupId)
    return (
      <li>
        <button
          type="button"
          onClick={() => open(n)}
          className="flex w-full items-start gap-3 rounded-card bg-card p-4 text-left border border-line shadow-card transition active:scale-[0.99]"
        >
          <span
            className={cx(
              'grid h-11 w-11 shrink-0 place-items-center rounded-2xl',
              n.read ? 'bg-fill text-ink' : 'bg-ink text-white',
            )}
          >
            {group && <GroupIconGlyph icon={group.icon} size={20} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className={cx('block text-[16px] leading-snug', !n.read && 'font-semibold')}>{n.text}</span>
            <span className="mt-1 flex gap-2 text-[13px] text-muted">
              <span>{group?.name}</span>
              <span className="text-muted-light">{ago(n.at)}</span>
            </span>
          </span>
          {!n.read && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-ink" aria-label="New" />}
        </button>
      </li>
    )
  }

  return (
    <Screen
      header={
        <div className="flex items-center justify-between">
          <IconButton label="Back to your groups" onClick={() => navigate('/')}>
            <ArrowLeft size={20} strokeWidth={1.8} aria-hidden="true" />
          </IconButton>
          {fresh.length > 0 && (
            <button
              type="button"
              onClick={() => dispatch({ type: 'readNotifications' })}
              className="h-11 rounded-full px-3 text-[15px] font-medium text-ink"
            >
              Mark all as read
            </button>
          )}
        </div>
      }
    >
      <div className="px-5 pb-8">
        <h1 className="mb-5 mt-6 text-[34px] font-bold leading-none tracking-tight">Notifications</h1>
        {sorted.length === 0 && (
          <div className="mt-16 flex flex-col items-center text-center text-muted">
            <BellOff size={32} strokeWidth={1.6} aria-hidden="true" />
            <p className="mt-3 text-[16px]">Nothing new. You’re all caught up.</p>
          </div>
        )}
        {fresh.length > 0 && (
          <>
            <h2 className="mb-3 text-[14px] font-medium text-muted">New</h2>
            <ul className="mb-6 flex flex-col gap-3">
              {fresh.map((n) => (
                <Row key={n.id} n={n} />
              ))}
            </ul>
          </>
        )}
        {earlier.length > 0 && (
          <>
            <h2 className="mb-3 text-[14px] font-medium text-muted">Earlier</h2>
            <ul className="flex flex-col gap-3">
              {earlier.map((n) => (
                <Row key={n.id} n={n} />
              ))}
            </ul>
          </>
        )}
      </div>
    </Screen>
  )
}
