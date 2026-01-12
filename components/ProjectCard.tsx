'use client'

import Link from 'next/link'
import { Project } from '@/types/database'
import ProjectStatusBadge from './ProjectStatusBadge'

interface ProjectCardProps {
  project: Project
  progress?: number
}

export default function ProjectCard({ project, progress = 0 }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {project.name}
        </h3>
        <ProjectStatusBadge status={project.status} />
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

