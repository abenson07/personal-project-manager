'use client'

import { ProjectPhase } from '@/types/database'

interface StatusProcessFlowProps {
  currentPhase: ProjectPhase
}

export default function StatusProcessFlow({ currentPhase }: StatusProcessFlowProps) {
  const stages = [
    { phase: ProjectPhase.CONCEPT, activeLabel: 'Planning', pastLabel: 'Planned' },
    { phase: ProjectPhase.PRD, activeLabel: 'In progress', pastLabel: 'In Progress' },
    { phase: ProjectPhase.COMPLETED, activeLabel: 'Complete', pastLabel: 'Completed' },
  ]

  const getCurrentPhaseIndex = () => {
    return stages.findIndex((s) => s.phase === currentPhase)
  }

  const currentIndex = getCurrentPhaseIndex()

  return (
    <div className="flex items-end gap-2">
      {stages.map((stage, index) => {
        const isPast = index < currentIndex
        const isActive = index === currentIndex
        const isFuture = index > currentIndex

        const label = isPast ? stage.pastLabel : stage.activeLabel

        return (
          <div key={stage.phase} className="flex flex-col items-start">
            <div
              className={`h-1.5 rounded-full ${
                isPast || isActive
                  ? 'bg-purple-500'
                  : 'bg-gray-300'
              }`}
              style={{ width: '100px' }}
            />
            <span className="mt-2 text-xs text-gray-700 whitespace-nowrap">
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

