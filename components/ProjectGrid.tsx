'use client'

import { Project, ProjectPhase } from '@/types/database'
import ProjectCard from './ProjectCard'

interface ProjectGridProps {
  projects: Project[]
  phase: ProjectPhase
}

export default function ProjectGrid({ projects, phase }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
        No projects in {phase} phase
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          progress={0}
        />
      ))}
    </div>
  )
}

