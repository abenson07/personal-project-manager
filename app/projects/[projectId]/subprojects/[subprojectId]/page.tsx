'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  getSubprojectById,
  updateSubprojectMode,
  updateSubprojectMarkdown,
  getProjectById,
  getNotesForSubproject
} from '@/lib/database'
import type { Subproject, Project } from '@/types/database'
import { letsBuildIt } from '@/lib/taskmaster'
import Breadcrumb from '@/components/Breadcrumb'
import NoteInput from '@/components/NoteInput'
import NoteTimeline from '@/components/NoteTimeline'
import ConfirmationDialog from '@/components/ConfirmationDialog'
import LoadingProgress from '@/components/LoadingProgress'
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
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState(0)
  const [generationSteps] = useState([
    'Aggregating notes...',
    'Generating PRD...',
    'Generating tasks...',
    'Saving to database...',
    'Complete!',
  ])

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
    if (!subproject || isTransitioning || isGenerating) return

    // Show confirmation dialog
    setShowConfirmation(true)
  }

  const confirmLetsBuildIt = async () => {
    if (!subproject) return

    setShowConfirmation(false)
    setIsGenerating(true)
    setGenerationStep(0)

    try {
      // Step 1: Aggregate notes
      setGenerationStep(1)
      const notes = await getNotesForSubproject(subprojectId)
      
      if (notes.length === 0) {
        throw new Error('No notes available. Please add some notes before generating PRD.')
      }

      // Step 2: Generate PRD
      setGenerationStep(2)
      const { prdMarkdown, tasksMarkdown } = await letsBuildIt(subprojectId, notes)

      // Step 3: Save to database and update mode
      setGenerationStep(3)
      const updated = await updateSubprojectMarkdown(
        subproject.id,
        prdMarkdown,
        tasksMarkdown,
        'build'
      )
      
      setSubproject(updated)
      setGenerationStep(4)

      // Small delay to show completion
      await new Promise(resolve => setTimeout(resolve, 500))

      // Reload to show build mode interface
      router.refresh()
    } catch (err) {
      console.error('Failed to generate PRD and tasks:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate PRD and tasks. Please try again.'
      alert(errorMessage)
      setIsGenerating(false)
      setGenerationStep(0)
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
                disabled={isTransitioning || isGenerating}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
              >
                <Rocket className="h-5 w-5" />
                {isGenerating ? 'Generating...' : "Let's Build It"}
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

          {/* Loading Progress */}
          {isGenerating && (
            <div className="mb-8">
              <LoadingProgress
                currentStep={generationSteps[generationStep]}
                steps={generationSteps}
                currentStepIndex={generationStep}
              />
            </div>
          )}

          {/* Confirmation Dialog */}
          <ConfirmationDialog
            isOpen={showConfirmation}
            title="Let's Build It!"
            message="This will generate a PRD and task breakdown from your notes using Taskmaster. This may take a few moments. Continue?"
            confirmText="Generate PRD & Tasks"
            cancelText="Cancel"
            onConfirm={confirmLetsBuildIt}
            onCancel={() => setShowConfirmation(false)}
          />
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

