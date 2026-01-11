'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProject } from '@/lib/database'
import { ProjectPhase } from '@/types/database'

interface NewProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
  const router = useRouter()
  const [projectName, setProjectName] = useState('')
  const [phase, setPhase] = useState<ProjectPhase>(ProjectPhase.CONCEPT)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectName.trim()) {
      setError('Project name is required')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const project = await createProject(projectName.trim(), phase)
      setIsCreating(false)
      // Reset form
      setProjectName('')
      setPhase(ProjectPhase.CONCEPT)
      onClose()
      // Navigate to the new project's concept page
      router.push(`/projects/${project.id}/concept`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    if (!isCreating) {
      setProjectName('')
      setPhase(ProjectPhase.CONCEPT)
      setError(null)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Create New Project
          </h2>
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="projectName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Project Name
            </label>
            <input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              required
              disabled={isCreating}
            />
          </div>

          <div>
            <label
              htmlFor="phase"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Initial Phase
            </label>
            <select
              id="phase"
              value={phase}
              onChange={(e) => setPhase(e.target.value as ProjectPhase)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              disabled={isCreating}
            >
              <option value={ProjectPhase.CONCEPT}>Concept</option>
              <option value={ProjectPhase.PRD}>PRD</option>
              <option value={ProjectPhase.COMPLETED}>Completed</option>
            </select>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !projectName.trim()}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {isCreating ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

