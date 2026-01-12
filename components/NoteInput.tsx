'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase'
import { createNote } from '@/lib/database'
import { Upload, X, Send } from 'lucide-react'

interface NoteInputProps {
  subprojectId: string
  onNoteSaved?: () => void
}

export default function NoteInput({ subprojectId, onNoteSaved }: NoteInputProps) {
  const [content, setContent] = useState('')
  const [attachedImage, setAttachedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadImageToStorage = useCallback(async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${subprojectId}/${Date.now()}.${fileExt}`
    const filePath = `subproject-images/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('subproject-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from('subproject-images')
      .getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL')
    }

    return urlData.publicUrl
  }, [subprojectId])

  const handleSubmit = useCallback(async () => {
    if (!content.trim() && !attachedImage) return

    setIsSaving(true)
    try {
      if (attachedImage) {
        // Upload image first
        let imageUrl: string
        try {
          imageUrl = await uploadImageToStorage(attachedImage)
        } catch (uploadError) {
          console.error('Image upload error:', uploadError)
          const errorMessage = uploadError instanceof Error 
            ? uploadError.message 
            : 'Failed to upload image. Make sure the Supabase Storage bucket "subproject-images" exists.'
          alert(`Image upload failed: ${errorMessage}`)
          setIsSaving(false)
          return
        }
        
        // Create note with text content and image URL
        // If there's text content, include it with the image as markdown
        if (content.trim()) {
          // Store both text and image reference in the note content as markdown
          await createNote(subprojectId, `${content.trim()}\n\n![Image](${imageUrl})`, 'text')
        } else {
          // Just image - store as image type with URL
          await createNote(subprojectId, imageUrl, 'image')
        }
      } else {
        // Just text
        await createNote(subprojectId, content.trim(), 'text')
      }

      // Reset form
      setContent('')
      setAttachedImage(null)
      setImagePreview(null)
      
      // Refocus textarea
      if (textareaRef.current) {
        textareaRef.current.focus()
      }

      if (onNoteSaved) {
        onNoteSaved()
      }
    } catch (error) {
      console.error('Failed to save note:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to save note. Please try again.'
      alert(`Failed to save note: ${errorMessage}`)
    } finally {
      setIsSaving(false)
    }
  }, [content, attachedImage, subprojectId, uploadImageToStorage, onNoteSaved])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.type.startsWith('image/')) {
      setAttachedImage(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    multiple: false,
    disabled: isSaving,
    noClick: true, // Don't open file dialog on click, only drag
  })

  const removeImage = useCallback(() => {
    setAttachedImage(null)
    setImagePreview(null)
  }, [])

  // Auto-focus on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  return (
    <div className="mb-6" {...getRootProps()}>
      <div className={`
        rounded-lg border-2 transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
      `}>
        <div className="p-4">
          <TextareaAutosize
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your note here... (Ctrl+Enter to submit)"
            className="w-full resize-none bg-transparent px-0 py-0 text-gray-900 placeholder-gray-400 focus:outline-none"
            minRows={3}
            maxRows={20}
          />
          
          {imagePreview && (
            <div className="mt-3 relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-48 rounded-lg border border-gray-300"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage()
                }}
                className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {!attachedImage && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
              <Upload className="h-4 w-4" />
              <span>Drag an image here or click to attach</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <input {...getInputProps()} ref={fileInputRef} />
            {!attachedImage && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                Attach Image
              </button>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleSubmit()
            }}
            disabled={isSaving || (!content.trim() && !attachedImage)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Submit Note'}
          </button>
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Press Ctrl+Enter (Cmd+Enter on Mac) to submit, or click the Submit button
      </p>
    </div>
  )
}
