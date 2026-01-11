'use client'

import { useEffect, useState } from 'react'
import { getProjectsByPhase } from '@/lib/database'
import type { Project } from '@/types/database'
import { ProjectPhase } from '@/types/database'
import ProjectGrid from '@/components/ProjectGrid'

export default function Dashboard() {
  const [activeProjects, setActiveProjects] = useState<Project[]>([])
  const [inDefinitionProjects, setInDefinitionProjects] = useState<Project[]>([])
  const [completedProjects, setCompletedProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const [active, inDefinition, completed] = await Promise.all([
          getProjectsByPhase(ProjectPhase.PRD),
          getProjectsByPhase(ProjectPhase.CONCEPT),
          getProjectsByPhase(ProjectPhase.COMPLETED),
        ])
        
        setActiveProjects(active)
        setInDefinitionProjects(inDefinition)
        setCompletedProjects(completed)
      } catch (error) {
        console.error('Failed to load projects:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600 dark:text-gray-400">Loading projects...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your projects and track progress
          </p>
        </div>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
          New Project
        </button>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Active Projects
        </h2>
        <ProjectGrid projects={activeProjects} phase={ProjectPhase.PRD} />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
          In Definition
        </h2>
        <ProjectGrid projects={inDefinitionProjects} phase={ProjectPhase.CONCEPT} />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Completed
        </h2>
        <ProjectGrid projects={completedProjects} phase={ProjectPhase.COMPLETED} />
      </section>
    </div>
  )
}
