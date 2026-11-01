import type { Group } from '../data/types'
import { useStore } from '../data/store'
import { Avatar, Sheet } from './ui'

const roleLabel = { owner: 'Owner', staff: 'Staff', member: '' } as const

// Who is in the group. Yuan asked "Can I see the names of the people?" (D11).
export function MembersSheet({ group, open, onClose }: { group: Group; open: boolean; onClose: () => void }) {
  const { state } = useStore()
  const sorted = [...group.members].sort((a, b) => {
    const order = { owner: 0, staff: 1, member: 2 }
    return order[a.role] - order[b.role]
  })
  return (
    <Sheet open={open} onClose={onClose} title={`${group.members.length} members`}>
      <ul className="max-h-[420px] overflow-y-auto rounded-card bg-card shadow-card">
        {sorted.map((m, i) => {
          const name = state.members[m.id]?.name ?? 'Member'
          return (
            <li key={m.id} className={'flex items-center gap-3 px-4 py-3 ' + (i > 0 ? 'border-t border-line' : '')}>
              <Avatar name={name} size={36} />
              <span className="flex-1 text-[16px] font-medium">{name}</span>
              {roleLabel[m.role] && (
                <span className="rounded-full bg-fill px-2.5 py-1 text-[12px] font-medium text-ink">{roleLabel[m.role]}</span>
              )}
            </li>
          )
        })}
      </ul>
    </Sheet>
  )
}
