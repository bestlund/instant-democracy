// Data model for the prototype.
//
// One "Thread" type covers both discussions and polls (decision D7):
// a discussion can get a poll inside it, and a poll always has comments
// under it. Only the starting point differs, so they share one screen.

export type Visibility = 'anonymous' | 'named'

export type Role = 'owner' | 'staff' | 'member'

export interface Member {
  id: string
  name: string
}

export type GroupIcon = 'home' | 'run' | 'plane'

export interface Group {
  id: string
  name: string
  icon: GroupIcon
  members: { id: string; role: Role }[]
}

export interface Message {
  id: string
  authorId: string
  visibility: Visibility
  text: string
  at: number // epoch ms
}

export interface PollOption {
  id: string
  label: string
}

export interface Vote {
  voterId: string
  optionId: string
  visibility: Visibility
}

export interface Poll {
  id: string
  question: string
  createdBy: string
  createdByVisibility: Visibility
  options: PollOption[]
  votes: Vote[]
  closesAt: number // epoch ms
}

export type TimelineItem =
  | { kind: 'message'; message: Message }
  | { kind: 'poll'; pollId: string; at: number }

export interface Decision {
  outcome: string
  responsibleId: string // who takes care of it (D10)
  done: boolean
  decidedAt: number
  votesCast: number
}

export interface Thread {
  id: string
  groupId: string
  title: string
  type: 'discussion' | 'poll'
  startedAt: number
  items: TimelineItem[]
  unread: number // comments the current user hasn't seen yet
  decision?: Decision
}

export interface AppNotification {
  id: string
  groupId: string
  threadId?: string
  text: string
  at: number
  read: boolean
}

export interface AppState {
  version: number
  meId: string
  members: Record<string, Member>
  groups: Group[]
  threads: Thread[]
  polls: Record<string, Poll>
  notifications: AppNotification[]
}
