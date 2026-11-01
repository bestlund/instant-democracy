import type { AppState, Thread } from './types'

// Read-only helpers that derive what screens show from the app state.

export function threadPolls(state: AppState, thread: Thread) {
  return thread.items.flatMap((i) => (i.kind === 'poll' ? [state.polls[i.pollId]] : [])).filter(Boolean)
}

export function hasVoted(state: AppState, pollId: string) {
  return state.polls[pollId]?.votes.some((v) => v.voterId === state.meId) ?? false
}

/** Open polls in a thread that the current user hasn't voted on. */
export function pendingPolls(state: AppState, thread: Thread) {
  const now = Date.now()
  return threadPolls(state, thread).filter((p) => p.closesAt > now && !hasVoted(state, p.id))
}

export function openThreads(state: AppState, groupId: string) {
  return state.threads.filter((t) => t.groupId === groupId && !t.decision)
}

export function decidedThreads(state: AppState, groupId: string) {
  return state.threads
    .filter((t) => t.groupId === groupId && t.decision)
    .sort((a, b) => b.decision!.decidedAt - a.decision!.decidedAt)
}

/**
 * Sort order for open threads (D9): things that need you first,
 * then whatever closes soonest, then the newest.
 */
export function sortOpenThreads(state: AppState, threads: Thread[]) {
  const key = (t: Thread) => {
    const pending = pendingPolls(state, t)
    const needsYou = pending.length > 0 ? 0 : 1
    const closes = Math.min(...threadPolls(state, t).map((p) => p.closesAt), Infinity)
    return { needsYou, closes, started: -t.startedAt }
  }
  return [...threads].sort((a, b) => {
    const ka = key(a)
    const kb = key(b)
    return ka.needsYou - kb.needsYou || ka.closes - kb.closes || ka.started - kb.started
  })
}

export function memberName(state: AppState, id: string) {
  return state.members[id]?.name ?? 'Someone'
}
