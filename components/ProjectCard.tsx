'use client'

import Link from 'next/link'
import { Project, ProjectPhase } from '@/types/database'
import EditableTitle from './EditableTitle'

interface ProjectCardProps {
  project: Project
  progress?: number
  onUpdate?: () => void
}

export default function ProjectCard({ project, progress = 0, onUpdate }: ProjectCardProps) {
  const phaseColors = {
    [ProjectPhase.CONCEPT]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    [ProjectPhase.PRD]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    [ProjectPhase.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  }

  return (
    <Link
      href={`/projects/${project.id}/concept`}
      className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
      onClick={(e) => {
        // Prevent navigation when clicking on title
        if ((e.target as HTMLElement).closest('.editable-title')) {
          e.preventDefault()
        }
      }}
    >
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 editable-title">
          <EditableTitle
            projectId={project.id}
            initialValue={project.name}
            onUpdate={onUpdate}
          />
        </h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${phaseColors[project.phase]}`}
        >
          {project.phase}
        </span>
      </div>
      
      {progress > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-blue-600 transition-all dark:bg-blue-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Updated {new Date(project.updated_at).toLocaleDateString()}
      </div>
    </Link>
  )
}

