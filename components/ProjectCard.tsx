'use client'

import Link from 'next/link'
import { Project, ProjectPhase } from '@/types/database'

interface ProjectCardProps {
  project: Project
  progress?: number
}

export default function ProjectCard({ project, progress = 0 }: ProjectCardProps) {
  const phaseColors = {
    [ProjectPhase.CONCEPT]: 'bg-gray-100 text-gray-800',
    [ProjectPhase.PRD]: 'bg-blue-100 text-blue-800',
    [ProjectPhase.COMPLETED]: 'bg-green-100 text-green-800',
  }

  return (
    <Link
      href={`/projects/${project.id}?view=notes`}
      className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {project.name}
        </h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${phaseColors[project.phase]}`}
        >
          {project.phase}
        </span>
      </div>
      
      {progress > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        Updated {new Date(project.updated_at).toLocaleDateString()}
      </div>
    </Link>
  )
}

