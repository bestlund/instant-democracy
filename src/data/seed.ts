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
  { id: 'lea', name: 'Lea' },
  { id: 'tom', name: 'Tom' },
  { id: 'anna', name: 'Anna' },
  { id: 'marco', name: 'Marco' },
  { id: 'sofia', name: 'Sofia' },
  { id: 'joao', name: 'João' },
  { id: 'ines', name: 'Inês' },
  { id: 'pedro', name: 'Pedro' },
  { id: 'clara', name: 'Clara' },
  { id: 'yuki', name: 'Yuki' },
  { id: 'ben', name: 'Ben' },
  { id: 'eva', name: 'Eva' },
]

const extraErasmus = Array.from({ length: 23 }, (_, i) => ({
  id: `erasmus-${i}`,
  name: `Student ${i + 1}`,
}))

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
    [...people, ...extraErasmus].map((m) => [m.id, m]),
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
          { id: 'lea', role: 'owner' },
          { id: 'me', role: 'member' },
          { id: 'tom', role: 'member' },
          { id: 'anna', role: 'staff' },
        ],
      },
      {
        id: 'run-club',
        name: 'Run club',
        icon: 'run',
        members: ['marco', 'me', 'sofia', 'joao', 'ines', 'pedro', 'clara', 'yuki', 'ben', 'eva', 'anna', 'tom'].map(
          (id, i) => ({ id, role: i === 0 ? ('owner' as const) : ('member' as const) }),
        ),
      },
      {
        id: 'erasmus',
        name: 'Erasmus friends',
        icon: 'plane',
        members: [
          { id: 'sofia', role: 'owner' as const },
          { id: 'me', role: 'staff' as const },
          ...['yuki', 'ben', 'eva', 'clara', 'pedro', 'ines', 'joao', 'marco', 'lea', 'tom'].map((id) => ({
            id,
            role: 'member' as const,
          })),
          ...extraErasmus.map((m) => ({ id: m.id, role: 'member' as const })),
        ],
      },
    ],
    polls: {
      'p-fridge': {
        id: 'p-fridge',
        question: 'Who calls the landlord about the fridge?',
        createdBy: 'lea',
        createdByVisibility: 'named',
        options: [
          { id: 'o-lea', label: 'Lea' },
          { id: 'o-tom', label: 'Tom' },
          { id: 'o-anna', label: 'Anna' },
          { id: 'o-me', label: 'You' },
        ],
        votes: [
          { voterId: 'lea', optionId: 'o-tom', visibility: 'named' },
          { voterId: 'anna', optionId: 'o-tom', visibility: 'anonymous' },
        ],
        closesAt: tonight(now),
      },
      'p-movie': {
        id: 'p-movie',
        question: 'Which film for movie night?',
        createdBy: 'tom',
        createdByVisibility: 'named',
        options: [
          { id: 'o-dune', label: 'Dune: Part Two' },
          { id: 'o-amelie', label: 'Amélie' },
          { id: 'o-spirited', label: 'Spirited Away' },
        ],
        votes: [{ voterId: 'tom', optionId: 'o-spirited', visibility: 'named' }],
        closesAt: now + 3 * DAY,
      },
      'p-route': {
        id: 'p-route',
        question: 'Route for the Sunday run?',
        createdBy: 'marco',
        createdByVisibility: 'named',
        options: [
          { id: 'o-river', label: 'River loop, 8 km' },
          { id: 'o-park', label: 'Botanical garden, 6 km' },
          { id: 'o-hill', label: 'Hill repeats, 5 km' },
        ],
        votes: [
          { voterId: 'marco', optionId: 'o-river', visibility: 'named' },
          { voterId: 'sofia', optionId: 'o-river', visibility: 'named' },
          { voterId: 'joao', optionId: 'o-park', visibility: 'anonymous' },
          { voterId: 'ines', optionId: 'o-river', visibility: 'named' },
          { voterId: 'clara', optionId: 'o-hill', visibility: 'named' },
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
              authorId: 'anna',
              visibility: 'anonymous',
              text: "The fridge hasn't been cooling for two days. My milk went off again.",
              at: at(-26 * HOUR, now),
            },
          },
          {
            kind: 'message',
            message: {
              id: 'm2',
              authorId: 'tom',
              visibility: 'named',
              text: 'Same here, and the freezer is full of water.',
              at: at(-25 * HOUR, now),
            },
          },
          {
            kind: 'message',
            message: {
              id: 'm3',
              authorId: 'lea',
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
              authorId: 'anna',
              visibility: 'named',
              text: 'Voted. Tom has the landlord’s number already.',
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
              authorId: 'tom',
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
          ['lea', 'I can cook on Friday. Pasta or curry?'],
          ['tom', 'Curry!'],
          ['anna', 'Pasta, but I’m happy either way.'],
          ['lea', 'Let’s keep talking, I’ll make a poll tomorrow.'],
          ['tom', 'I’ll buy the rice if it’s curry.'],
          ['anna', 'Can we eat at 19:30? I have class until 19.'],
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
          responsibleId: 'lea',
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
          responsibleId: 'tom',
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
              authorId: 'sofia',
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
        text: 'Lea started a poll: Who calls the landlord about the fridge?',
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
        text: 'Marco started a poll: Route for the Sunday run?',
        at: at(-7 * HOUR, now),
        read: false,
      },
      {
        id: 'n4',
        groupId: 'roommates',
        threadId: 'cleaning-rota',
        text: 'Decided: a weekly cleaning rota. Lea takes care of it.',
        at: at(-10 * DAY, now),
        read: true,
      },
    ],
  }
}
