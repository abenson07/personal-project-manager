'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  getSubprojectById,
  updateSubprojectMode,
  getProjectById
} from '@/lib/database'
import type { Subproject, Project } from '@/types/database'
import Breadcrumb from '@/components/Breadcrumb'
import NoteInput from '@/components/NoteInput'
import NoteTimeline from '@/components/NoteTimeline'
import { Rocket } from 'lucide-react'

function SubprojectPageContent() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const subprojectId = params.subprojectId as string
  
  const [subproject, setSubproject] = useState<Subproject | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [subprojectData, projectData] = await Promise.all([
        getSubprojectById(subprojectId),
        getProjectById(projectId),
      ])
      
      if (!subprojectData) {
        setError('Subproject not found')
        return
      }
      
      if (!projectData) {
        setError('Project not found')
        return
      }
      
      setSubproject(subprojectData)
      setProject(projectData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subproject')
      console.error('Failed to load subproject data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (subprojectId && projectId) {
      loadData()
    }
  }, [subprojectId, projectId])

  const handleNoteSaved = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleLetsBuildIt = async () => {
    if (!subproject || isTransitioning) return

    setIsTransitioning(true)
    try {
      const updated = await updateSubprojectMode(subproject.id, 'build')
      setSubproject(updated)
      // Optionally reload to show build mode interface
      // For now, we'll just update the mode
    } catch (err) {
      console.error('Failed to transition to build mode:', err)
      alert('Failed to transition to build mode. Please try again.')
    } finally {
      setIsTransitioning(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-gray-600">Loading subproject...</p>
        </div>
      </div>
    )
  }

  if (error || !subproject || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-800">{error || 'Subproject not found'}</p>
            <button
              onClick={() => router.push(`/projects/${projectId}`)}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
            >
              Go back to project
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render based on mode
  if (subproject.mode === 'planned') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Projects', href: '/' },
              { label: project.name, href: `/projects/${projectId}` },
              { label: subproject.name },
            ]}
          />

          {/* Header */}
          <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="mb-2 text-3xl font-bold text-gray-900">
                  {subproject.name}
                </h1>
                <p className="text-sm text-gray-600">
                  Planning phase - Capture your thoughts and ideas
                </p>
              </div>
              <button
                onClick={handleLetsBuildIt}
                disabled={isTransitioning}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
              >
                <Rocket className="h-5 w-5" />
                {isTransitioning ? 'Transitioning...' : "Let's Build It"}
              </button>
            </div>
          </div>

          {/* Note Input */}
          <NoteInput
            subprojectId={subprojectId}
            onNoteSaved={handleNoteSaved}
          />

          {/* Note Timeline */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Your Notes</h2>
            <NoteTimeline
              subprojectId={subprojectId}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>
      </div>
    )
  }

  // For build and complete modes, show placeholder for now
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Projects', href: '/' },
            { label: project.name, href: `/projects/${projectId}` },
            { label: subproject.name },
          ]}
        />
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {subproject.name}
          </h1>
          <p className="text-sm text-gray-600">
            Mode: {subproject.mode} (Build mode interface coming soon)
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SubprojectPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-gray-600">Loading subproject...</p>
        </div>
      </div>
    }>
      <SubprojectPageContent />
    </Suspense>
  )
}

