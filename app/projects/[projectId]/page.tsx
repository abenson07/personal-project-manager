'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  getProjectById,
  getSubprojectsByProjectId,
  createSubproject,
  updateProjectStatusFromSubprojects
} from '@/lib/database'
import type { Project, Subproject } from '@/types/database'
import { supabase } from '@/lib/supabase'
import SubprojectCard from '@/components/SubprojectCard'
import AddSubprojectForm from '@/components/AddSubprojectForm'
import Breadcrumb from '@/components/Breadcrumb'
import ProjectStatusBadge from '@/components/ProjectStatusBadge'

function ProjectPageContent() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [subprojects, setSubprojects] = useState<Subproject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProjectData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [projectData, subprojectsData] = await Promise.all([
        getProjectById(projectId),
        getSubprojectsByProjectId(projectId),
      ])
      
      if (!projectData) {
        setError('Project not found')
        return
      }
      
      setProject(projectData)
      setSubprojects(subprojectsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project')
      console.error('Failed to load project data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (projectId) {
      loadProjectData()
    }
  }, [projectId])

  // Redirect to subproject if there's exactly one
  useEffect(() => {
    if (!loading && subprojects.length === 1 && project) {
      router.replace(`/projects/${projectId}/subprojects/${subprojects[0].id}`)
    }
  }, [loading, subprojects, project, projectId, router])

  // Set up real-time subscription for subproject changes
  useEffect(() => {
    if (!projectId) return

    const channel = supabase
      .channel(`subprojects:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subprojects',
          filter: `project_id=eq.${projectId}`,
        },
        async () => {
          // Reload subprojects when changes occur
          const updatedSubprojects = await getSubprojectsByProjectId(projectId)
          setSubprojects(updatedSubprojects)
          
          // Update project status based on subproject modes
          if (project) {
            const updatedProject = await updateProjectStatusFromSubprojects(projectId)
            setProject(updatedProject)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, project])

  const handleSubprojectCreated = async () => {
    await loadProjectData()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-800">{error || 'Project not found'}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
            >
              Go back to projects
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Projects', href: '/' },
            { label: project.name },
          ]}
        />

        {/* Project Header */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                {project.name}
              </h1>
              <div className="flex items-center gap-3">
                <ProjectStatusBadge status={project.status} />
                <span className="text-sm text-gray-600">
                  Updated {new Date(project.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Subproject Form */}
        <AddSubprojectForm
          projectId={projectId}
          onSubprojectCreated={handleSubprojectCreated}
        />

        {/* Subprojects List */}
        {subprojects.length === 0 ? (
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
            <h3 className="mt-4 text-lg font-medium text-gray-900">No subprojects yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by creating your first subproject above
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {subprojects.map((subproject) => (
              <SubprojectCard
                key={subproject.id}
                subproject={subproject}
                projectId={projectId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProjectPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    }>
      <ProjectPageContent />
    </Suspense>
  )
}
