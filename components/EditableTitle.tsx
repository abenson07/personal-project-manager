'use client'

import { useState, useEffect, useRef } from 'react'
import { updateProject } from '@/lib/database'

interface EditableTitleProps {
  projectId: string
  initialValue: string
  className?: string
  onUpdate?: () => void
}

export default function EditableTitle({
  projectId,
  initialValue,
  className = '',
  onUpdate,
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Auto-save with debouncing
  useEffect(() => {
    if (!isEditing || value === initialValue) return

    const timer = setTimeout(async () => {
      try {
        await updateProject(projectId, { name: value.trim() || 'Untitled Project' })
        if (onUpdate) {
          onUpdate()
        }
      } catch (error) {
        console.error('Failed to update project name:', error)
        // Revert on error
        setValue(initialValue)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [value, isEditing, projectId, initialValue, onUpdate])

  const handleBlur = () => {
    setIsEditing(false)
    if (value.trim() === '') {
      setValue(initialValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setIsEditing(false)
    }
    if (e.key === 'Escape') {
      setValue(initialValue)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`bg-transparent border-b-2 border-blue-500 outline-none ${className}`}
      />
    )
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`cursor-text hover:opacity-70 transition-opacity ${className}`}
    >
      {value}
    </span>
  )
}

