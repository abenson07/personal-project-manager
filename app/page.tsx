'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getProjectsByPhase, createProject } from '@/lib/database'
import type { Project } from '@/types/database'
import { ProjectPhase } from '@/types/database'
import ProjectGrid from '@/components/ProjectGrid'

export default function Dashboard() {
  const router = useRouter()
  const [activeProjects, setActiveProjects] = useState<Project[]>([])
  const [inDefinitionProjects, setInDefinitionProjects] = useState<Project[]>([])
  const [completedProjects, setCompletedProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

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

  useEffect(() => {
    loadProjects()
  }, [])

  const handleNewProject = async () => {
    setIsCreating(true)
    try {
      const project = await createProject('New Project', ProjectPhase.CONCEPT)
      router.push(`/projects/${project.id}?view=notes`)
    } catch (error) {
      console.error('Failed to create project:', error)
      setIsCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading projects...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your projects and track progress
          </p>
        </div>
        <button
          onClick={handleNewProject}
          disabled={isCreating}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? 'Creating...' : 'New Project'}
        </button>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Active Projects
        </h2>
        <ProjectGrid projects={activeProjects} phase={ProjectPhase.PRD} />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          In Definition
        </h2>
        <ProjectGrid projects={inDefinitionProjects} phase={ProjectPhase.CONCEPT} />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Completed
        </h2>
        <ProjectGrid projects={completedProjects} phase={ProjectPhase.COMPLETED} />
      </section>
    </div>
  )
}
