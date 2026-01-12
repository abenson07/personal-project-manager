'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase'
import { createNote } from '@/lib/database'
import { Upload, X, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  subprojectId: string
  onImageUploaded?: () => void
}

export default function ImageUpload({ subprojectId, onImageUploaded }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const uploadImage = useCallback(async (file: File) => {
    setUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${subprojectId}/${Date.now()}.${fileExt}`
      const filePath = `subproject-images/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('subproject-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('subproject-images')
        .getPublicUrl(filePath)

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL')
      }

      // Create note with image URL
      await createNote(subprojectId, urlData.publicUrl, 'image')

      if (onImageUploaded) {
        onImageUploaded()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
      console.error('Image upload error:', err)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [subprojectId, onImageUploaded])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        uploadImage(file)
      } else {
        setError('Please upload an image file')
      }
    })
  }, [uploadImage])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    multiple: false,
    disabled: uploading,
  })

  return (
    <div className="mb-6">
      <div
        {...getRootProps()}
        className={`
          cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors
          ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }
          ${uploading ? 'cursor-not-allowed opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">Uploading image...</p>
            {uploadProgress > 0 && (
              <p className="text-xs text-gray-500">{uploadProgress}%</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-600">
              {isDragActive
                ? 'Drop the image here'
                : 'Drag & drop an image here, or click to select'}
            </p>
            <p className="text-xs text-gray-500">
              Supports PNG, JPG, GIF, and WebP
            </p>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-2 rounded-lg bg-red-50 p-3">
          <div className="flex items-center gap-2">
            <X className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}

