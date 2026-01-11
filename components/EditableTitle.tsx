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
  const isSavingRef = useRef(false)
  const pendingSaveValueRef = useRef<string | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7245/ingest/d8096195-7dbf-428c-ae61-87270a241e93',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EditableTitle.tsx:23',message:'initialValue changed',data:{initialValue,currentValue:value,isEditing,isSaving:isSavingRef.current,pendingSave:pendingSaveValueRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
    // Only sync if not editing, not currently saving, and no pending save
    if (!isEditing && !isSavingRef.current && !pendingSaveValueRef.current) {
      // Only sync if the value actually changed (avoid unnecessary updates)
      if (value !== initialValue) {
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/d8096195-7dbf-428c-ae61-87270a241e93',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EditableTitle.tsx:27',message:'Syncing value from initialValue',data:{oldValue:value,newValue:initialValue},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        setValue(initialValue)
      }
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/d8096195-7dbf-428c-ae61-87270a241e93',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EditableTitle.tsx:31',message:'Skipping sync - editing or saving',data:{isEditing,isSaving:isSavingRef.current,pendingSave:pendingSaveValueRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    }
  }, [initialValue, isEditing, value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Save function that can be called immediately or via debounce
  const performSave = async (saveValue: string) => {
    // #region agent log
    const saveStartTime = Date.now();
    fetch('http://127.0.0.1:7245/ingest/d8096195-7dbf-428c-ae61-87270a241e93',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EditableTitle.tsx:42',message:'Save starting',data:{savingValue:saveValue,currentValue:value,initialValue},timestamp:saveStartTime,sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    isSavingRef.current = true;
    pendingSaveValueRef.current = saveValue; // Track pending save
    try {
      await updateProject(projectId, { name: saveValue.trim() || 'Untitled Project' })
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/d8096195-7dbf-428c-ae61-87270a241e93',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EditableTitle.tsx:47',message:'Save completed successfully',data:{savedValue:saveValue,currentValue:value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      // Dispatch event to notify sidebar and other components
      window.dispatchEvent(new CustomEvent('projectUpdated', { detail: { projectId } }))
      if (onUpdate) {
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/d8096195-7dbf-428c-ae61-87270a241e93',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EditableTitle.tsx:50',message:'Calling onUpdate callback',data:{savedValue:saveValue,currentValue:value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        onUpdate()
      }
      // Clear pending save only after onUpdate completes (which triggers initialValue update)
      // Use a small delay to ensure parent has updated initialValue
      setTimeout(() => {
        pendingSaveValueRef.current = null;
        isSavingRef.current = false;
      }, 100);
    } catch (error) {
      console.error('Failed to update project name:', error)
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/d8096195-7dbf-428c-ae61-87270a241e93',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EditableTitle.tsx:56',message:'Save failed',data:{error:String(error),currentValue:value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      // Revert on error
      setValue(initialValue)
      pendingSaveValueRef.current = null;
      isSavingRef.current = false;
    }
  }

  // Auto-save with debouncing
  useEffect(() => {
    if (!isEditing || value === initialValue) {
      // Clear timer if not editing or value matches initial
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
        pendingSaveValueRef.current = null
      }
      return
    }

    // Set pending save immediately when debounce starts
    pendingSaveValueRef.current = value

    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/d8096195-7dbf-428c-ae61-87270a241e93',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EditableTitle.tsx:38',message:'Debounce timer started',data:{value,initialValue,isEditing},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null
      performSave(value)
    }, 500) // 500ms debounce

    return () => {
      if (debounceTimerRef.current) {
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/d8096195-7dbf-428c-ae61-87270a241e93',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EditableTitle.tsx:64',message:'Debounce timer cleared',data:{value,initialValue},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
        // Don't clear pendingSaveValueRef here - it might be needed if Enter is pressed
      }
    }
  }, [value, isEditing, projectId, initialValue, onUpdate])

  const handleBlur = () => {
    // If there's a pending debounced save, trigger it immediately
    if (debounceTimerRef.current && value !== initialValue) {
      // Clear the timer and trigger immediate save
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
      // Set pending save BEFORE stopping editing to prevent sync
      pendingSaveValueRef.current = value
      // Trigger immediate save
      performSave(value)
    }
    
    setIsEditing(false)
    if (value.trim() === '') {
      // Clear pending save if value is empty
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
      pendingSaveValueRef.current = null
      setValue(initialValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
      // Set pending save BEFORE stopping editing to prevent sync
      if (value !== initialValue) {
        pendingSaveValueRef.current = value
        // Trigger immediate save
        performSave(value)
      }
      setIsEditing(false)
    }
    if (e.key === 'Escape') {
      // Clear any pending saves
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
      pendingSaveValueRef.current = null
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
        onChange={(e) => {
          const newValue = e.target.value;
          // #region agent log
          fetch('http://127.0.0.1:7245/ingest/d8096195-7dbf-428c-ae61-87270a241e93',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EditableTitle.tsx:78',message:'User input onChange',data:{oldValue:value,newValue,isSaving:isSavingRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          setValue(newValue)
        }}
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

