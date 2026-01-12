'use client'

import { Project } from '@/types/database'

interface ProjectStatusBadgeProps {
  status: Project['status']
  className?: string
}

export default function ProjectStatusBadge({ status, className = '' }: ProjectStatusBadgeProps) {
  const statusConfig: Record<Project['status'], { label: string; colors: string }> = {
    planning: {
      label: 'Planning',
      colors: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    in_progress: {
      label: 'In Progress',
      colors: 'bg-orange-100 text-orange-800 border-orange-200',
    },
    complete: {
      label: 'Complete',
      colors: 'bg-green-100 text-green-800 border-green-200',
    },
  }

  const config = statusConfig[status] || statusConfig.planning

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${config.colors} ${className}`}
      role="status"
      aria-label={`Project status: ${config.label}`}
    >
      {config.label}
    </span>
  )
}

