import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUp, ChartNoAxesColumn, Plus, VenetianMask } from 'lucide-react'
import { useStore } from '../data/store'
import { memberName, pendingPolls } from '../data/selectors'
import type { Message, Visibility } from '../data/types'
import { PollCard } from '../components/PollCard'
import { useToast } from '../components/Toast'
import { Avatar, IconButton, Screen, cx } from '../components/ui'
import { dayLabel, timeOfDay } from '../lib/time'

// A discussion or a poll (D7). Same screen for both: a timeline of comments
// with polls inside it, and a comment bar at the bottom like any chat app
// (it replaced the "+ Suggest option" button, which nobody would use).

function Bubble({ message, mine }: { message: Message; mine: boolean }) {
  const { state } = useStore()
  const anon = message.visibility === 'anonymous'
  const name = mine ? (anon ? 'You · anonymously' : 'You') : anon ? 'Anonymous' : memberName(state, message.authorId)

  return (
    <div className={cx('flex items-end gap-2', mine && 'flex-row-reverse')}>
      {!mine && <Avatar name={name} size={30} anonymous={anon} dim={anon} />}
      <div className={cx('flex max-w-[78%] flex-col', mine ? 'items-end' : 'items-start')}>
        <span className="mb-1 flex items-center gap-1 px-1 text-[12px] font-medium text-muted">
          {anon && <VenetianMask size={13} strokeWidth={1.8} aria-hidden="true" />}
          {name} · {timeOfDay(message.at)}
        </span>
        <p
          className={cx(
            'whitespace-pre-wrap rounded-[20px] px-4 py-2.5 text-[16px] leading-snug',
            mine ? 'rounded-br-md bg-ink text-white' : 'rounded-bl-md bg-card text-ink shadow-card',
          )}
        >
          {message.text}
        </p>
      </div>
    </div>
  )
}

export default function ThreadScreen() {
  const { groupId, threadId } = useParams()
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const toast = useToast()
  const [text, setText] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('named')
  const scroller = useRef<HTMLDivElement>(null)
  const pollRef = useRef<HTMLDivElement>(null)
  const prevCount = useRef<number | null>(null)

  const group = state.groups.find((g) => g.id === groupId)
  const thread = state.threads.find((t) => t.id === threadId && t.groupId === groupId)

  useEffect(() => {
    if (thread && thread.unread > 0) dispatch({ type: 'seenThread', threadId: thread.id })
  }, [thread, dispatch])

  const firstPendingPollId = thread ? pendingPolls(state, thread)[0]?.id : undefined
  const count = thread?.items.length ?? 0

  // On open: jump to the poll that needs your vote, otherwise to the newest comment.
  // After sending: scroll to the bottom.
  useLayoutEffect(() => {
    const el = scroller.current
    if (!el) return
    const initial = prevCount.current === null || prevCount.current === count
    prevCount.current = count
    if (initial && firstPendingPollId && pollRef.current) {
      el.scrollTop = pollRef.current.offsetTop - 12
      return
    }
    el.scrollTop = el.scrollHeight
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  if (!group || !thread) return <Navigate to={groupId ? `/g/${groupId}` : '/'} replace />

  const send = () => {
    if (!text.trim()) return
    dispatch({ type: 'send', threadId: thread.id, text, visibility })
    setText('')
  }

  let lastDay = ''

  return (
    <Screen
      header={
        <div className="flex items-center gap-3 pb-3">
          <IconButton label={`Back to ${group.name}`} onClick={() => navigate(`/g/${group.id}`)}>
            <ArrowLeft size={20} strokeWidth={1.8} aria-hidden="true" />
          </IconButton>
          <div className="min-w-0">
            <h1 className="truncate text-[19px] font-semibold leading-tight">{thread.title}</h1>
            <p className="text-[13px] text-muted">
              {group.name} · {thread.type === 'poll' ? 'Poll' : 'Discussion'}
            </p>
          </div>
        </div>
      }
      footer={
        <div>
          <button
            type="button"
            aria-pressed={visibility === 'anonymous'}
            onClick={() => setVisibility((v) => (v === 'named' ? 'anonymous' : 'named'))}
            className="mb-2 flex h-8 items-center gap-1.5 rounded-full px-1 text-[13px] text-muted"
          >
            <VenetianMask size={15} strokeWidth={1.8} aria-hidden="true" />
            {visibility === 'named' ? 'Commenting as you' : 'Commenting anonymously'}
            <span className="font-medium text-ink underline underline-offset-4">Change</span>
          </button>
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
          >
            <IconButton label="Add a poll" onClick={() => toast('Add a poll: coming in the next step')}>
              <Plus size={20} strokeWidth={1.8} aria-hidden="true" />
            </IconButton>
            <label htmlFor="comment" className="sr-only">
              Write a comment
            </label>
            <input
              id="comment"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a comment…"
              autoComplete="off"
              className="h-12 min-w-0 flex-1 rounded-full bg-card px-4 text-[16px] text-ink shadow-card outline-none placeholder:text-muted-light focus:ring-2 focus:ring-ink"
            />
            <button
              type="submit"
              aria-label="Send"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-white transition active:scale-95"
            >
              <ArrowUp size={20} strokeWidth={2} aria-hidden="true" />
            </button>
          </form>
        </div>
      }
    >
      <div ref={scroller} className="relative h-full overflow-y-auto overscroll-contain">
        <div className="flex flex-col gap-4 px-4 pb-4 pt-2">
          {thread.items.map((item) => {
            const t = item.kind === 'message' ? item.message.at : item.at
            const day = dayLabel(t)
            const divider = day !== lastDay
            lastDay = day
            return (
              <Fragment key={item.kind === 'message' ? item.message.id : item.pollId}>
                {divider && (
                  <div className="flex justify-center">
                    <span className="rounded-full bg-fill px-3 py-1 text-[12px] font-medium text-muted">{day}</span>
                  </div>
                )}
                {item.kind === 'message' ? (
                  <Bubble message={item.message} mine={item.message.authorId === state.meId} />
                ) : (
                  <div ref={item.pollId === firstPendingPollId ? pollRef : undefined}>
                    {state.polls[item.pollId] && <PollCard poll={state.polls[item.pollId]} group={group} />}
                  </div>
                )}
              </Fragment>
            )
          })}
          {thread.items.every((i) => i.kind !== 'poll') && (
            <button
              type="button"
              onClick={() => toast('Add a poll: coming in the next step')}
              className="flex items-center justify-center gap-2 rounded-card border border-dashed border-muted-light py-4 text-[15px] font-medium text-ink"
            >
              <ChartNoAxesColumn size={18} strokeWidth={1.8} aria-hidden="true" />
              Ready to decide? Add a poll
            </button>
          )}
        </div>
      </div>
    </Screen>
  )
}
