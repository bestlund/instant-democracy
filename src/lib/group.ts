import type { AppState, Group, Thread } from '../data/types'
import { openThreads, pendingPolls, threadPolls } from '../data/selectors'
import { deadline } from './time'

export function lower(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1)
}

/** Threads in a group that need the current user: a vote or unread comments. */
export function attentionThreads(state: AppState, group: Group) {
  return openThreads(state, group.id).filter((t) => pendingPolls(state, t).length > 0 || t.unread > 0)
}

/**
 * One line under the group name on Home (D5): the most urgent thing to do,
 * so you can tell whether to open the group without tapping into it.
 */
export function groupStatus(state: AppState, group: Group): { text: string; strong: boolean } {
  const threads = openThreads(state, group.id)
  const pending = threads
    .flatMap((t) => pendingPolls(state, t).map((p) => ({ t, p })))
    .sort((a, b) => a.p.closesAt - b.p.closesAt)
  if (pending.length) {
    const { t, p } = pending[0]
    return { text: `Vote on ${t.title} · ${lower(deadline(p.closesAt))}`, strong: true }
  }
  const unread = threads.filter((t) => t.unread > 0).sort((a, b) => b.unread - a.unread)
  if (unread.length) {
    const t = unread[0]
    return { text: `${t.unread} new ${t.unread === 1 ? 'comment' : 'comments'} in ${t.title}`, strong: false }
  }
  return { text: 'All caught up', strong: false }
}

export function messageCount(thread: Thread) {
  return thread.items.filter((i) => i.kind === 'message').length
}

export function openPoll(state: AppState, thread: Thread) {
  const now = Date.now()
  return threadPolls(state, thread).find((p) => p.closesAt > now)
}
