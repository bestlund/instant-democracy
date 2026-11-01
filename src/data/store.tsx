import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import { createSeed } from './seed'
import type { AppState, Thread, Visibility } from './types'

// App state lives in memory and is saved to localStorage, so a tester's
// vote or comment survives a page refresh. "Reset demo" restores the seed
// between test sessions.

const STORAGE_KEY = 'instant-democracy:v1'

type Action =
  | { type: 'vote'; pollId: string; optionId: string; visibility: Visibility }
  | { type: 'send'; threadId: string; text: string; visibility: Visibility }
  | { type: 'seenThread'; threadId: string }
  | { type: 'readNotifications' }
  | { type: 'reset' }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'vote': {
      const poll = state.polls[action.pollId]
      if (!poll) return state
      const votes = poll.votes.filter((v) => v.voterId !== state.meId)
      votes.push({ voterId: state.meId, optionId: action.optionId, visibility: action.visibility })
      return { ...state, polls: { ...state.polls, [poll.id]: { ...poll, votes } } }
    }
    case 'send': {
      const text = action.text.trim()
      if (!text) return state
      const now = Date.now()
      return {
        ...state,
        threads: state.threads.map((t) =>
          t.id !== action.threadId
            ? t
            : {
                ...t,
                items: [
                  ...t.items,
                  {
                    kind: 'message',
                    message: {
                      id: `m-${now}`,
                      authorId: state.meId,
                      visibility: action.visibility,
                      text,
                      at: now,
                    },
                  },
                ],
              },
        ),
      }
    }
    case 'seenThread':
      return {
        ...state,
        threads: state.threads.map((t) => (t.id === action.threadId ? { ...t, unread: 0 } : t)),
        notifications: state.notifications.map((n) =>
          n.threadId === action.threadId ? { ...n, read: true } : n,
        ),
      }
    case 'readNotifications':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) }
    case 'reset':
      return createSeed()
  }
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as AppState
  } catch {
    // Private mode or blocked storage: fall back to fresh data.
  }
  return createSeed()
}

const StoreContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Ignore: the prototype still works, it just won't remember.
    }
  }, [state])
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

// ---------- Selectors ----------

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
