'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getProjectById, getProjectNotes, createProjectNote, getAssetsByProject, createAsset } from '@/lib/database'
import type { Project, ProjectNote, Asset } from '@/types/database'
import MarkdownEditor from '@/components/MarkdownEditor'
import AssetSidebar from '@/components/AssetSidebar'
import EditableTitle from '@/components/EditableTitle'

export default function ConceptPage() {
  const params = useParams()
  const projectId = params.projectId as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [notes, setNotes] = useState<ProjectNote[]>([])
  const [currentNote, setCurrentNote] = useState('')
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectData, notesData, assetsData] = await Promise.all([
          getProjectById(projectId),
          getProjectNotes(projectId),
          getAssetsByProject(projectId),
        ])
        
        setProject(projectData)
        setNotes(notesData)
        setAssets(assetsData)
        if (notesData.length > 0) {
          setCurrentNote(notesData[0].content)
        }
      } catch (error) {
        console.error('Failed to load project data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      loadData()
    }
  }, [projectId])

  const handleSaveNote = async () => {
    if (!projectId || !currentNote.trim()) return
    
    try {
      await createProjectNote(projectId, currentNote)
      const updatedNotes = await getProjectNotes(projectId)
      setNotes(updatedNotes)
    } catch (error) {
      console.error('Failed to save note:', error)
    }
  }

  const handleAddAsset = async (type: string, source: string, annotation?: string) => {
    if (!projectId) return
    
    try {
      await createAsset(projectId, type as any, source, annotation)
      const updatedAssets = await getAssetsByProject(projectId)
      setAssets(updatedAssets)
    } catch (error) {
      console.error('Failed to add asset:', error)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!project) {
    return <div className="p-8">Project not found</div>
  }

  const handleProjectUpdate = async () => {
    const updatedProject = await getProjectById(projectId)
    if (updatedProject) {
      setProject(updatedProject)
    }
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 p-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
          <EditableTitle
            projectId={projectId}
            initialValue={project.name}
            onUpdate={handleProjectUpdate}
            className="text-3xl font-bold"
          />
        </h1>
        <MarkdownEditor
          value={currentNote}
          onChange={setCurrentNote}
          onSave={handleSaveNote}
        />
      </div>
      <AssetSidebar
        assets={assets}
        onAddAsset={handleAddAsset}
      />
    </div>
  )
}

