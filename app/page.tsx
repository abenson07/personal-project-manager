'use client'

import { useEffect, useState } from 'react'
import { fetchProjectsWithSubprojectCounts, getProjectProgress } from '@/lib/database'
import type { Project } from '@/types/database'
import ProjectCard from '@/components/ProjectCard'
import CreateProjectModal from '@/components/CreateProjectModal'
import { Plus } from 'lucide-react'

interface ProjectWithCount extends Project {
  subproject_count: number
}

export default function Home() {
  const [projects, setProjects] = useState<ProjectWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projectProgress, setProjectProgress] = useState<Record<string, number>>({})

  const loadProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchProjectsWithSubprojectCounts()
      setProjects(data)

      // Calculate progress for each project
      const progressMap: Record<string, number> = {}
      await Promise.all(
        data.map(async (project) => {
          try {
            const progress = await getProjectProgress(project.id)
            progressMap[project.id] = progress
          } catch (err) {
            progressMap[project.id] = 0
          }
        })
      )
      setProjectProgress(progressMap)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleProjectCreated = () => {
    loadProjects()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="mt-2 text-gray-600">
              Manage your projects and track their progress
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={loadProjects}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && !error && (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No projects yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by creating your first project
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Project
            </button>
          </div>
        )}

        {/* Project Grid */}
        {projects.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                progress={projectProgress[project.id] || 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  )
}
