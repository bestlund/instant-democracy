import { useState } from 'react'
import { Check, Info, VenetianMask, Vote } from 'lucide-react'
import { useStore } from '../data/store'
import { memberName } from '../data/selectors'
import type { Group, Poll, Visibility } from '../data/types'
import { deadline, isUrgent } from '../lib/time'
import { Avatar, Chip, PrimaryButton, Segmented, cx } from './ui'

// The poll, inside a discussion or as the start of a poll thread (D7).
//
// Results are hidden until you vote (D12): if you can see that Gytis already
// has two votes, you're likely to follow the group instead of choosing
// for yourself. After voting the full result is shown.
//
// Who has voted is always visible, what they voted only if they chose to
// show their name (D11). This answers Carlos ("how do we know everyone is
// going to vote?") without breaking anonymity.

function Participation({ poll, group }: { poll: Poll; group: Group }) {
  const { state } = useStore()
  const votedIds = new Set(poll.votes.map((v) => v.voterId))
  const waiting = group.members
    .filter((m) => !votedIds.has(m.id))
    .map((m) => (m.id === state.meId ? 'you' : memberName(state, m.id)))
  const ordered = [...group.members].sort((a, b) => Number(votedIds.has(b.id)) - Number(votedIds.has(a.id)))

  return (
    <div className="rounded-2xl bg-canvas p-3">
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-semibold">
          {poll.votes.length} of {group.members.length} voted
        </span>
        <span className="flex -space-x-1.5">
          {ordered.slice(0, 6).map((m) => (
            <Avatar key={m.id} name={memberName(state, m.id)} size={26} dim={!votedIds.has(m.id)} ring />
          ))}
        </span>
      </div>
      {waiting.length > 0 && group.members.length <= 12 && (
        <p className="mt-1 text-[13px] text-muted">
          Waiting for {waiting.length === 1 ? waiting[0] : `${waiting.slice(0, -1).join(', ')} and ${waiting[waiting.length - 1]}`}
        </p>
      )}
    </div>
  )
}

export function PollCard({ poll, group }: { poll: Poll; group: Group }) {
  const { state, dispatch } = useStore()
  const myVote = poll.votes.find((v) => v.voterId === state.meId)
  const [editing, setEditing] = useState(false)
  const [choice, setChoice] = useState<string | null>(myVote?.optionId ?? null)
  // Anonymous by default (D13): lowers the barrier for people like Lea who are afraid of being judged.
  const [visibility, setVisibility] = useState<Visibility>(myVote?.visibility ?? 'anonymous')
  const [error, setError] = useState(false)

  const showResults = !!myVote && !editing
  const total = poll.votes.length
  const pending = !myVote
  const author = poll.createdByVisibility === 'anonymous' ? 'Anonymous' : memberName(state, poll.createdBy)

  const submit = () => {
    if (!choice) {
      setError(true)
      return
    }
    dispatch({ type: 'vote', pollId: poll.id, optionId: choice, visibility })
    setEditing(false)
  }

  return (
    <section aria-label={`Poll: ${poll.question}`} className="rounded-card bg-card p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <Chip solid={pending && isUrgent(poll.closesAt)}>
          <Vote size={15} strokeWidth={1.9} aria-hidden="true" />
          {deadline(poll.closesAt)}
        </Chip>
        <span className="truncate text-[13px] text-muted">by {author}</span>
      </div>
      <h3 className="mt-3 text-[20px] font-semibold leading-snug">{poll.question}</h3>

      {!showResults ? (
        <>
          <div role="radiogroup" aria-label="Options" className="mt-4 flex flex-col gap-2">
            {poll.options.map((o) => {
              const selected = choice === o.id
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setChoice(o.id)
                    setError(false)
                  }}
                  className={cx(
                    'flex min-h-[52px] items-center gap-3 rounded-2xl px-4 text-left text-[16px] transition',
                    selected ? 'bg-fill font-medium ring-2 ring-ink' : 'ring-1 ring-line',
                  )}
                >
                  <span
                    className={cx(
                      'grid h-5 w-5 shrink-0 place-items-center rounded-full border-2',
                      selected ? 'border-ink bg-ink' : 'border-muted-light',
                    )}
                    aria-hidden="true"
                  >
                    {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                  {o.label}
                </button>
              )
            })}
          </div>

          <p className="mb-2 mt-4 text-[13px] font-medium text-muted">Vote as</p>
          <Segmented
            label="Vote as"
            value={visibility}
            onChange={setVisibility}
            options={[
              {
                value: 'anonymous',
                label: (
                  <>
                    <VenetianMask size={16} strokeWidth={1.8} aria-hidden="true" /> Anonymous
                  </>
                ),
              },
              { value: 'named', label: 'Show my name' },
            ]}
          />

          <div className="mt-4">
            <Participation poll={poll} group={group} />
          </div>

          <PrimaryButton className="mt-4 h-12 text-[16px]" onClick={submit}>
            {myVote ? 'Update vote' : 'Vote'}
          </PrimaryButton>
          {error && (
            <p role="alert" className="mt-2 text-center text-[14px] font-medium text-ink">
              Pick an option first
            </p>
          )}
          <p className="mt-3 flex items-start gap-2 text-[13px] leading-snug text-muted">
            <Info size={15} strokeWidth={1.8} className="mt-px shrink-0" aria-hidden="true" />
            Results show after you vote, so earlier votes don’t sway yours.
          </p>
        </>
      ) : (
        <>
          <ul className="mt-4 flex flex-col gap-3.5">
            {poll.options.map((o) => {
              const votes = poll.votes.filter((v) => v.optionId === o.id)
              const pct = total ? Math.round((votes.length / total) * 100) : 0
              const mine = myVote?.optionId === o.id
              const named = votes
                .filter((v) => v.visibility === 'named')
                .map((v) => (v.voterId === state.meId ? 'You' : memberName(state, v.voterId)))
              const anon = votes.length - named.length
              const who = [...named, anon ? `${anon} anonymous` : ''].filter(Boolean).join(', ')
              return (
                <li key={o.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className={cx('flex items-center gap-1.5 text-[16px]', mine && 'font-semibold')}>
                      {mine && <Check size={16} strokeWidth={2.4} aria-hidden="true" />}
                      {o.label}
                    </span>
                    <span className="text-[15px] font-medium tabular-nums">{pct}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-fill">
                    <div
                      className={cx('h-full rounded-full', mine ? 'bg-ink' : 'bg-muted-light')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[13px] text-muted">
                    {votes.length} {votes.length === 1 ? 'vote' : 'votes'}
                    {who && ` (${who})`}
                  </p>
                </li>
              )
            })}
          </ul>

          <div className="mt-4">
            <Participation poll={poll} group={group} />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[14px] text-muted">
              {myVote!.visibility === 'anonymous' && <VenetianMask size={16} strokeWidth={1.8} aria-hidden="true" />}
              You voted {myVote!.visibility === 'anonymous' ? 'anonymously' : 'with your name'}
            </span>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="h-11 rounded-full px-3 text-[14px] font-medium text-ink underline underline-offset-4"
            >
              Change vote
            </button>
          </div>
        </>
      )}
    </section>
  )
}
