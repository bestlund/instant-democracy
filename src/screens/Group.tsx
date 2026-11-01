import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, ChartNoAxesColumn, ChevronRight, MessagesSquare, Plus, Settings, Vote } from 'lucide-react'
import { useStore } from '../data/store'
import { decidedThreads, hasVoted, memberName, openThreads, sortOpenThreads } from '../data/selectors'
import type { Thread } from '../data/types'
import { useToast } from '../components/Toast'
import { MembersSheet } from '../components/MembersSheet'
import { ActionRow, AvatarStack, Avatar, Chip, IconButton, PrimaryButton, Screen, Segmented, Sheet, cx } from '../components/ui'
import { messageCount, openPoll } from '../lib/group'
import { deadline, isUrgent, shortDate } from '../lib/time'

// Group screen (D3): has to look clearly different from Home, so it opens
// with the members (people) instead of a list that resembles the group list.
// Every card says its status in words instead of only an icon.

function ThreadCard({ thread, members, onOpen }: { thread: Thread; members: number; onOpen: () => void }) {
  const { state } = useStore()
  const poll = openPoll(state, thread)
  const voted = poll ? hasVoted(state, poll.id) : false
  const pending = poll && !voted
  const urgent = !!poll && pending && isUrgent(poll.closesAt)
  const comments = messageCount(thread)

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-card bg-card p-4 text-left shadow-card transition active:scale-[0.99]"
    >
      <div className="flex items-center justify-between">
        {poll ? (
          <Chip solid={urgent}>
            <Vote size={15} strokeWidth={1.9} aria-hidden="true" />
            {pending ? 'Vote' : 'Voting'} · {deadline(poll.closesAt).replace('Closes', 'closes')}
          </Chip>
        ) : (
          <Chip>
            <MessagesSquare size={15} strokeWidth={1.9} aria-hidden="true" />
            Discussion
          </Chip>
        )}
        <ChevronRight size={20} className="text-muted-light" aria-hidden="true" />
      </div>
      <h3 className="mt-3 text-[19px] font-semibold leading-tight">{thread.title}</h3>
      <p className="mt-1 text-[14px] text-muted">
        {poll ? (
          <>
            {poll.votes.length} of {members} voted ·{' '}
            {pending ? <span className="font-medium text-ink">you haven’t voted</span> : 'you voted'}
          </>
        ) : (
          <>
            {comments} comments
            {thread.unread > 0 && (
              <>
                {' · '}
                <span className="font-medium text-ink">{thread.unread} new</span>
              </>
            )}
          </>
        )}
      </p>
    </button>
  )
}

function DecidedCard({ thread }: { thread: Thread }) {
  const { state } = useStore()
  const d = thread.decision!
  const who = memberName(state, d.responsibleId)
  return (
    <div className="rounded-card bg-card p-4 shadow-card">
      <Chip>
        <Check size={15} strokeWidth={2} aria-hidden="true" />
        Decided · {shortDate(d.decidedAt)}
      </Chip>
      <h3 className="mt-3 text-[19px] font-semibold leading-tight">{thread.title}</h3>
      <p className="mt-1 text-[16px] text-ink">{d.outcome}</p>
      <div className="mt-3 flex items-center gap-2.5 border-t border-line pt-3">
        <Avatar name={who} size={28} />
        <span className="flex-1 text-[14px] text-ink">
          <span className="font-medium">{who}</span> takes care of it
        </span>
        <span className={cx('text-[13px] font-medium', d.done ? 'text-ink' : 'text-muted')}>
          {d.done ? 'Done' : 'Not done yet'}
        </span>
      </div>
    </div>
  )
}

export default function Group() {
  const { groupId } = useParams()
  const { state } = useStore()
  const navigate = useNavigate()
  const toast = useToast()
  const [tab, setTab] = useState<'open' | 'decided'>('open')
  const [newOpen, setNewOpen] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)

  const group = state.groups.find((g) => g.id === groupId)
  if (!group) return <Navigate to="/" replace />

  const open = sortOpenThreads(state, openThreads(state, group.id))
  const decided = decidedThreads(state, group.id)
  const names = group.members.map((m) => memberName(state, m.id))

  const notYet = (what: string) => {
    setNewOpen(false)
    toast(`${what}: coming in the next step`)
  }

  return (
    <Screen
      header={
        <div className="flex items-center justify-between">
          <IconButton label="Back to your groups" onClick={() => navigate('/')}>
            <ArrowLeft size={20} strokeWidth={1.8} aria-hidden="true" />
          </IconButton>
          <IconButton label="Group settings" onClick={() => toast('Group settings: coming in the next step')}>
            <Settings size={20} strokeWidth={1.8} aria-hidden="true" />
          </IconButton>
        </div>
      }
      footer={
        <PrimaryButton onClick={() => setNewOpen(true)}>
          <Plus size={20} strokeWidth={2} aria-hidden="true" />
          New
        </PrimaryButton>
      }
      overlay={
        <>
          <Sheet open={newOpen} onClose={() => setNewOpen(false)} title={`New in ${group.name}`}>
            <div className="flex flex-col gap-3">
              <ActionRow
                icon={<MessagesSquare size={22} strokeWidth={1.8} aria-hidden="true" />}
                title="Discussion"
                description="Bring something up. You can add a poll later."
                onClick={() => notYet('New discussion')}
              />
              <ActionRow
                icon={<ChartNoAxesColumn size={22} strokeWidth={1.8} aria-hidden="true" />}
                title="Poll"
                description="Let everyone vote. People can comment on it."
                onClick={() => notYet('New poll')}
              />
            </div>
          </Sheet>
          <MembersSheet group={group} open={membersOpen} onClose={() => setMembersOpen(false)} />
        </>
      }
    >
      <div className="px-5 pb-6">
        <h1 className="mt-6 text-[34px] font-bold leading-none tracking-tight">{group.name}</h1>
        <button
          type="button"
          onClick={() => setMembersOpen(true)}
          className="mt-3 flex items-center gap-3 rounded-full py-1 pr-2 text-left"
          aria-label={`See all ${group.members.length} members`}
        >
          <AvatarStack names={names} />
          <span className="text-[15px] text-muted">{group.members.length} members</span>
          <ChevronRight size={18} className="text-muted-light" aria-hidden="true" />
        </button>

        <div className="mt-5">
          <Segmented
            label="Show"
            value={tab}
            onChange={setTab}
            options={[
              { value: 'open', label: <>Open <span className="text-muted">{open.length}</span></> },
              { value: 'decided', label: <>Decided <span className="text-muted">{decided.length}</span></> },
            ]}
          />
        </div>

        <ul className="mt-4 flex flex-col gap-3">
          {tab === 'open' &&
            (open.length ? (
              open.map((t) => (
                <li key={t.id}>
                  <ThreadCard thread={t} members={group.members.length} onOpen={() => navigate(`/g/${group.id}/t/${t.id}`)} />
                </li>
              ))
            ) : (
              <li className="rounded-card bg-card p-6 text-center shadow-card">
                <p className="text-[17px] font-semibold">Nothing open right now</p>
                <p className="mt-1 text-[15px] text-muted">Something bothering you? Start a discussion.</p>
              </li>
            ))}
          {tab === 'decided' &&
            decided.map((t) => (
              <li key={t.id}>
                <DecidedCard thread={t} />
              </li>
            ))}
        </ul>
      </div>
    </Screen>
  )
}
