'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { createProject } from '@/lib/database'
import { useRouter } from 'next/navigation'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onProjectCreated?: () => void
}

interface ProjectFormData {
  name: string
}

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormData>({
    defaultValues: {
      name: '',
    },
  })

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const project = await createProject(data.name.trim(), 'planning')
      
      // Reset form
      reset()
      
      // Close modal
      onClose()
      
      // Callback to refresh project list
      if (onProjectCreated) {
        onProjectCreated()
      }
      
      // Navigate to new project
      router.push(`/projects/${project.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      reset()
      setError(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
            Create New Project
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              id="project-name"
              type="text"
              {...register('name', {
                required: 'Project name is required',
                minLength: {
                  value: 1,
                  message: 'Project name must be at least 1 character',
                },
                maxLength: {
                  value: 100,
                  message: 'Project name must be less than 100 characters',
                },
              })}
              className={`w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter project name"
              disabled={isSubmitting}
              autoFocus
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-sm text-red-800" role="alert">
                {error}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

