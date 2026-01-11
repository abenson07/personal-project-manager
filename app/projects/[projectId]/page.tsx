'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { getProjectById, getProjectNotes, createProjectNote, getAssetsByProject, createAsset, getFeatureSetsByProject } from '@/lib/database'
import type { Project, ProjectNote, Asset, FeatureSet } from '@/types/database'
import MarkdownEditor from '@/components/MarkdownEditor'
import AssetSidebar from '@/components/AssetSidebar'
import EditableTitle from '@/components/EditableTitle'
import StatusProcessFlow from '@/components/StatusProcessFlow'

function ProjectPageContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = params.projectId as string
  
  const view = searchParams.get('view') || 'notes'
  
  const [project, setProject] = useState<Project | null>(null)
  const [notes, setNotes] = useState<ProjectNote[]>([])
  const [currentNote, setCurrentNote] = useState('')
  const [assets, setAssets] = useState<Asset[]>([])
  const [featureSets, setFeatureSets] = useState<FeatureSet[]>([])
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectData, notesData, assetsData, featureSetsData] = await Promise.all([
          getProjectById(projectId),
          getProjectNotes(projectId),
          getAssetsByProject(projectId),
          getFeatureSetsByProject(projectId),
        ])
        
        setProject(projectData)
        setNotes(notesData)
        setAssets(assetsData)
        setFeatureSets(featureSetsData)
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

  const handleProjectUpdate = async () => {
    const updatedProject = await getProjectById(projectId)
    if (updatedProject) {
      setProject(updatedProject)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!project) {
    return <div className="p-8">Project not found</div>
  }

  return (
    <div className="flex h-full bg-white">
      <div className="flex-1 flex flex-col">
        {/* Header Section */}
        <div className="border-b border-gray-200 px-8 py-6">
          <div className="mb-4">
            <StatusProcessFlow currentPhase={project.phase} />
          </div>
          
          <div className="mb-2 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              <EditableTitle
                projectId={projectId}
                initialValue={project.name}
                onUpdate={handleProjectUpdate}
                className="text-3xl font-bold"
              />
            </h1>
            <button
              onClick={() => {
                // TODO: Implement plan project functionality
                console.log('Plan project clicked')
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Plan Project
            </button>
          </div>
          
          <p className="text-sm text-gray-600">
            Last updated {formatDate(project.updated_at)}
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-8">
          <div className="flex gap-6">
            <button
              onClick={() => router.push(`/projects/${projectId}?view=notes`)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                view === 'notes'
                  ? 'border-b-2 border-gray-900 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Notes
            </button>
            <button
              onClick={() => router.push(`/projects/${projectId}?view=prd`)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                view === 'prd'
                  ? 'border-b-2 border-gray-900 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              PRD
            </button>
            <button
              onClick={() => router.push(`/projects/${projectId}?view=features`)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                view === 'features'
                  ? 'border-b-2 border-gray-900 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Feature Sets
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {view === 'notes' && (
            <div className="p-8">
              <MarkdownEditor
                value={currentNote}
                onChange={setCurrentNote}
                onSave={handleSaveNote}
                preview={false}
              />
            </div>
          )}

          {view === 'prd' && (
            <div className="p-8">
              <MarkdownEditor
                value={summary}
                onChange={setSummary}
                onSave={() => {}}
                preview={true}
              />
            </div>
          )}

          {view === 'features' && (
            <div className="p-8">
              <h2 className="mb-4 text-xl font-semibold">Feature Sets</h2>
              {featureSets.length === 0 ? (
                <p className="text-gray-600">No feature sets yet</p>
              ) : (
                <div className="space-y-4">
                  {featureSets.map((featureSet) => (
                    <div
                      key={featureSet.id}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <h3 className="font-semibold text-gray-900">
                        {featureSet.name}
                      </h3>
                      {featureSet.description && (
                        <p className="mt-2 text-gray-600">
                          {featureSet.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Asset Sidebar - only show in notes view */}
      {view === 'notes' && (
        <AssetSidebar
          assets={assets}
          onAddAsset={handleAddAsset}
        />
      )}
    </div>
  )
}

export default function ProjectPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <ProjectPageContent />
    </Suspense>
  )
}

