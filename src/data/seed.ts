import type { AppState, Member } from './types'

// Mock data for user testing.
// Groups are named after communities and threads after topics, so they
// can't be mistaken for each other (D3: Gil, Duarte and Marko mixed them up).
// All times are relative to "now" so deadlines always look realistic.

const MIN = 60 * 1000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

const people: Member[] = [
  { id: 'me', name: 'You' },
  { id: 'jacob', name: 'Jacob' },
  { id: 'gytis', name: 'Gytis' },
  { id: 'elizabeth', name: 'Elizabeth' },
  { id: 'elisabetta', name: 'Elisabetta' },
]

// Everyone outside the project group is a numbered student.
const students = Array.from({ length: 30 }, (_, i) => ({
  id: `student-${i}`,
  name: `Student ${i + 1}`,
}))
const studentIds = students.map((s) => s.id)

function at(offset: number, base: number) {
  return base + offset
}

/** The deadline today at 23:00, or in 3 hours if it's already late. */
function tonight(now: number) {
  const d = new Date(now)
  d.setHours(23, 0, 0, 0)
  const t = d.getTime()
  return t - now > 1.5 * HOUR ? t : now + 3 * HOUR
}

export function createSeed(now = Date.now()): AppState {
  const members = Object.fromEntries(
    [...people, ...students].map((m) => [m.id, m]),
  )

  return {
    version: 1,
    meId: 'me',
    members,
    groups: [
      {
        id: 'roommates',
        name: 'Roommates',
        icon: 'home',
        members: [
          { id: 'elizabeth', role: 'owner' },
          { id: 'me', role: 'member' },
          { id: 'gytis', role: 'member' },
          { id: 'elisabetta', role: 'staff' },
        ],
      },
      {
        id: 'run-club',
        name: 'Run club',
        icon: 'run',
        members: ['jacob', 'me', 'gytis', 'elisabetta', ...studentIds.slice(0, 8)].map(
          (id, i) => ({ id, role: i === 0 ? ('owner' as const) : ('member' as const) }),
        ),
      },
      {
        id: 'erasmus',
        name: 'Erasmus friends',
        icon: 'plane',
        members: [
          { id: 'elisabetta', role: 'owner' as const },
          { id: 'me', role: 'staff' as const },
          ...['jacob', 'gytis', 'elizabeth', ...studentIds].map((id) => ({
            id,
            role: 'member' as const,
          })),
        ],
      },
    ],
    polls: {
      'p-fridge': {
        id: 'p-fridge',
        question: 'Who calls the landlord about the fridge?',
        createdBy: 'elizabeth',
        createdByVisibility: 'named',
        options: [
          { id: 'o-elizabeth', label: 'Elizabeth' },
          { id: 'o-gytis', label: 'Gytis' },
          { id: 'o-elisabetta', label: 'Elisabetta' },
          { id: 'o-me', label: 'You' },
        ],
        votes: [
          { voterId: 'elizabeth', optionId: 'o-gytis', visibility: 'named' },
          { voterId: 'elisabetta', optionId: 'o-gytis', visibility: 'anonymous' },
        ],
        closesAt: tonight(now),
      },
      'p-movie': {
        id: 'p-movie',
        question: 'Which film for movie night?',
        createdBy: 'gytis',
        createdByVisibility: 'named',
        options: [
          { id: 'o-dune', label: 'Dune: Part Two' },
          { id: 'o-amelie', label: 'Amélie' },
          { id: 'o-spirited', label: 'Spirited Away' },
        ],
        votes: [{ voterId: 'gytis', optionId: 'o-spirited', visibility: 'named' }],
        closesAt: now + 3 * DAY,
      },
      'p-route': {
        id: 'p-route',
        question: 'Route for the Sunday run?',
        createdBy: 'jacob',
        createdByVisibility: 'named',
        options: [
          { id: 'o-river', label: 'River loop, 8 km' },
          { id: 'o-park', label: 'Botanical garden, 6 km' },
          { id: 'o-hill', label: 'Hill repeats, 5 km' },
        ],
        votes: [
          { voterId: 'jacob', optionId: 'o-river', visibility: 'named' },
          { voterId: 'student-0', optionId: 'o-river', visibility: 'named' },
          { voterId: 'student-1', optionId: 'o-park', visibility: 'anonymous' },
          { voterId: 'student-2', optionId: 'o-river', visibility: 'named' },
          { voterId: 'student-3', optionId: 'o-hill', visibility: 'named' },
        ],
        closesAt: now + 2 * DAY,
      },
    },
    threads: [
      {
        id: 'broken-fridge',
        groupId: 'roommates',
        title: 'Broken fridge',
        type: 'discussion',
        startedAt: at(-26 * HOUR, now),
        unread: 1,
        items: [
          {
            kind: 'message',
            message: {
              id: 'm1',
              authorId: 'elisabetta',
              visibility: 'anonymous',
              text: "The fridge hasn't been cooling for two days. My milk went off again.",
              at: at(-26 * HOUR, now),
            },
          },
          {
            kind: 'message',
            message: {
              id: 'm2',
              authorId: 'gytis',
              visibility: 'named',
              text: 'Same here, and the freezer is full of water.',
              at: at(-25 * HOUR, now),
            },
          },
          {
            kind: 'message',
            message: {
              id: 'm3',
              authorId: 'elizabeth',
              visibility: 'named',
              text: "Someone should call the landlord. Let's decide who, so it actually happens this time.",
              at: at(-3 * HOUR, now),
            },
          },
          { kind: 'poll', pollId: 'p-fridge', at: at(-3 * HOUR + 2 * MIN, now) },
          {
            kind: 'message',
            message: {
              id: 'm4',
              authorId: 'elisabetta',
              visibility: 'named',
              text: 'Voted. Gytis has the landlord’s number already.',
              at: at(-40 * MIN, now),
            },
          },
        ],
      },
      {
        id: 'movie-night',
        groupId: 'roommates',
        title: 'Movie night',
        type: 'poll',
        startedAt: at(-5 * HOUR, now),
        unread: 0,
        items: [
          { kind: 'poll', pollId: 'p-movie', at: at(-5 * HOUR, now) },
          {
            kind: 'message',
            message: {
              id: 'm5',
              authorId: 'gytis',
              visibility: 'named',
              text: 'Saturday at 20:00 in the living room. I’ll bring popcorn.',
              at: at(-5 * HOUR + 3 * MIN, now),
            },
          },
        ],
      },
      {
        id: 'dinner-friday',
        groupId: 'roommates',
        title: 'Dinner Friday',
        type: 'discussion',
        startedAt: at(-2 * DAY, now),
        unread: 2,
        items: [
          ['elizabeth', 'I can cook on Friday. Pasta or curry?'],
          ['gytis', 'Curry!'],
          ['elisabetta', 'Pasta, but I’m happy either way.'],
          ['elizabeth', 'Let’s keep talking, I’ll make a poll tomorrow.'],
          ['gytis', 'I’ll buy the rice if it’s curry.'],
          ['elisabetta', 'Can we eat at 19:30? I have class until 19.'],
        ].map(([authorId, text], i) => ({
          kind: 'message' as const,
          message: {
            id: `d${i}`,
            authorId,
            visibility: 'named' as const,
            text,
            at: at(-2 * DAY + i * 2 * HOUR, now),
          },
        })),
      },
      {
        id: 'cleaning-rota',
        groupId: 'roommates',
        title: 'Cleaning rota',
        type: 'poll',
        startedAt: at(-12 * DAY, now),
        unread: 0,
        items: [],
        decision: {
          outcome: 'A weekly rota, starting Monday',
          responsibleId: 'elizabeth',
          done: true,
          decidedAt: at(-10 * DAY, now),
          votesCast: 4,
        },
      },
      {
        id: 'shower-curtain',
        groupId: 'roommates',
        title: 'New shower curtain',
        type: 'discussion',
        startedAt: at(-6 * DAY, now),
        unread: 0,
        items: [],
        decision: {
          outcome: 'Buy one at IKEA, split the cost',
          responsibleId: 'gytis',
          done: false,
          decidedAt: at(-4 * DAY, now),
          votesCast: 3,
        },
      },
      {
        id: 'sunday-route',
        groupId: 'run-club',
        title: 'Sunday route',
        type: 'poll',
        startedAt: at(-7 * HOUR, now),
        unread: 0,
        items: [{ kind: 'poll', pollId: 'p-route', at: at(-7 * HOUR, now) }],
      },
      {
        id: 'porto-trip',
        groupId: 'erasmus',
        title: 'Day trip to Porto',
        type: 'discussion',
        startedAt: at(-3 * DAY, now),
        unread: 0,
        items: [
          {
            kind: 'message',
            message: {
              id: 'pt1',
              authorId: 'elisabetta',
              visibility: 'named',
              text: 'Who’s in for Porto in two weeks? Train is 1 hour.',
              at: at(-3 * DAY, now),
            },
          },
        ],
      },
    ],
    notifications: [
      {
        id: 'n1',
        groupId: 'roommates',
        threadId: 'broken-fridge',
        text: 'Elizabeth started a poll: Who calls the landlord about the fridge?',
        at: at(-3 * HOUR, now),
        read: false,
      },
      {
        id: 'n2',
        groupId: 'roommates',
        threadId: 'dinner-friday',
        text: '2 new comments in Dinner Friday',
        at: at(-5 * HOUR, now),
        read: false,
      },
      {
        id: 'n3',
        groupId: 'run-club',
        threadId: 'sunday-route',
        text: 'Jacob started a poll: Route for the Sunday run?',
        at: at(-7 * HOUR, now),
        read: false,
      },
      {
        id: 'n4',
        groupId: 'roommates',
        threadId: 'cleaning-rota',
        text: 'Decided: a weekly cleaning rota. Elizabeth takes care of it.',
        at: at(-10 * DAY, now),
        read: true,
      },
    ],
  }
}
