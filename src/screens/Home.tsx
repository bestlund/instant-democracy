import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChartNoAxesColumn, ChevronRight, Link as LinkIcon, MessagesSquare, Plus, Users } from 'lucide-react'
import { useStore } from '../data/store'
import { useToast } from '../components/Toast'
import { ActionRow, IconButton, PrimaryButton, Screen, Sheet, cx } from '../components/ui'
import { GroupIconGlyph } from '../components/GroupIcon'
import { attentionThreads, groupStatus } from '../lib/group'

// Home (D4): the list version testers preferred, plus a bell that collects
// every notification (the idea taken from the second version). One "+ New"
// button starts everything, because 4 of 8 testers pressed it first (D6).

export default function Home() {
  const { state } = useStore()
  const navigate = useNavigate()
  const toast = useToast()
  const [sheetOpen, setSheetOpen] = useState(false)

  const unreadNotifications = state.notifications.filter((n) => !n.read).length

  // Groups that need you float to the top (D9).
  const groups = [...state.groups]
    .map((g) => ({ g, attention: attentionThreads(state, g).length, status: groupStatus(state, g) }))
    .sort((a, b) => Number(b.status.strong) - Number(a.status.strong) || b.attention - a.attention)

  const notYet = (what: string) => {
    setSheetOpen(false)
    toast(`${what}: coming in the next step`)
  }

  return (
    <Screen
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-white" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M4 9.5l3.2 3.2L14 5.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-[17px] font-semibold tracking-tight">Instant democracy</span>
          </div>
          <IconButton label="Notifications" badge={unreadNotifications} onClick={() => navigate('/notifications')}>
            <Bell size={20} strokeWidth={1.8} aria-hidden="true" />
          </IconButton>
        </div>
      }
      footer={
        <PrimaryButton onClick={() => setSheetOpen(true)}>
          <Plus size={20} strokeWidth={2} aria-hidden="true" />
          New
        </PrimaryButton>
      }
      overlay={
        <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Start something new">
          <div className="flex flex-col gap-3">
            <ActionRow
              icon={<MessagesSquare size={22} strokeWidth={1.8} aria-hidden="true" />}
              title="Discussion"
              description="Bring up something with a group"
              onClick={() => notYet('New discussion')}
            />
            <ActionRow
              icon={<ChartNoAxesColumn size={22} strokeWidth={1.8} aria-hidden="true" />}
              title="Poll"
              description="Let a group vote on a few options"
              onClick={() => notYet('New poll')}
            />
            <ActionRow
              icon={<Users size={22} strokeWidth={1.8} aria-hidden="true" />}
              title="Group"
              description="For your flat, club or friends"
              onClick={() => notYet('New group')}
            />
            <ActionRow
              icon={<LinkIcon size={22} strokeWidth={1.8} aria-hidden="true" />}
              title="Join with a link or code"
              description="Someone invited you"
              onClick={() => notYet('Join a group')}
            />
          </div>
        </Sheet>
      }
    >
      <div className="px-5 pb-6">
        <h1 className="mb-5 mt-7 text-[34px] font-bold leading-none tracking-tight">Your groups</h1>
        <ul className="flex flex-col gap-3">
          {groups.map(({ g, attention, status }) => (
            <li key={g.id}>
              <button
                type="button"
                onClick={() => navigate(`/g/${g.id}`)}
                className="flex w-full items-center gap-4 rounded-card bg-card p-4 text-left shadow-card transition active:scale-[0.99]"
              >
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-ink text-white">
                  <GroupIconGlyph icon={g.icon} size={24} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[18px] font-semibold leading-tight">{g.name}</span>
                  <span className="mt-0.5 block text-[14px] text-muted">{g.members.length} members</span>
                  <span
                    className={cx(
                      'mt-1 block text-[14px] leading-snug',
                      status.strong ? 'font-medium text-ink' : 'text-muted',
                    )}
                  >
                    {status.text}
                  </span>
                </span>
                {attention > 0 ? (
                  <span
                    className="grid h-7 min-w-7 place-items-center rounded-full bg-ink px-2 text-[13px] font-semibold text-white"
                    aria-label={`${attention} need you`}
                  >
                    {attention}
                  </span>
                ) : (
                  <ChevronRight size={20} className="text-muted-light" aria-hidden="true" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Screen>
  )
}
