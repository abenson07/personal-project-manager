'use client'

import Link from 'next/link'
import type { Subproject } from '@/types/database'

interface SubprojectCardProps {
  subproject: Subproject
  projectId: string
}

export default function SubprojectCard({ subproject, projectId }: SubprojectCardProps) {
  const modeConfig: Record<Subproject['mode'], { label: string; colors: string }> = {
    planned: {
      label: 'Planning',
      colors: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    build: {
      label: 'Building',
      colors: 'bg-orange-100 text-orange-800 border-orange-200',
    },
    complete: {
      label: 'Complete',
      colors: 'bg-green-100 text-green-800 border-green-200',
    },
  }

  const config = modeConfig[subproject.mode]

  return (
    <Link
      href={`/projects/${projectId}/subprojects/${subproject.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {subproject.name}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${config.colors}`}
            >
              {config.label}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 text-xs text-gray-500">
        Updated {new Date(subproject.updated_at).toLocaleDateString()}
      </div>
    </Link>
  )
}

