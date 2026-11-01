import { Footprints, House, Plane } from 'lucide-react'
import type { GroupIcon } from '../data/types'

export function GroupIconGlyph({ icon, size = 22 }: { icon: GroupIcon; size?: number }) {
  const props = { size, strokeWidth: 1.8, 'aria-hidden': true as const }
  if (icon === 'home') return <House {...props} />
  if (icon === 'run') return <Footprints {...props} />
  return <Plane {...props} />
}
