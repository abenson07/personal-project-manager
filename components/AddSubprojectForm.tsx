'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { createSubproject } from '@/lib/database'
import { Plus } from 'lucide-react'

interface AddSubprojectFormProps {
  projectId: string
  onSubprojectCreated: () => void
}

interface SubprojectFormData {
  name: string
}

export default function AddSubprojectForm({ projectId, onSubprojectCreated }: AddSubprojectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubprojectFormData>({
    defaultValues: {
      name: '',
    },
  })

  const onSubmit = async (data: SubprojectFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      await createSubproject(projectId, data.name.trim(), 'planned')
      
      // Reset form
      reset()
      
      // Callback to refresh subproject list
      onSubprojectCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subproject')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <input
            type="text"
            {...register('name', {
              required: 'Subproject name is required',
              minLength: {
                value: 1,
                message: 'Subproject name must be at least 1 character',
              },
              maxLength: {
                value: 100,
                message: 'Subproject name must be less than 100 characters',
              },
            })}
            className={`w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter subproject name"
            disabled={isSubmitting}
            autoFocus
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.name.message}
            </p>
          )}
          {error && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {isSubmitting ? 'Adding...' : 'Add Subproject'}
        </button>
      </div>
    </form>
  )
}

