'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { 
  getProjectById, 
  getProjectNotes, 
  createProjectNote, 
  getAssetsByProject, 
  createAsset, 
  getFeatureSetsByProject,
  getPRDNotesByProject,
  createPRDNote,
  markPRDNotesAsTriaged
} from '@/lib/database'
import type { Project, ProjectNote, Asset, FeatureSet, PRDNote } from '@/types/database'
import { PRDNoteContext, AssetType } from '@/types/database'
// TODO: Uncomment when components are implemented in later tasks
// import MarkdownEditor from '@/components/MarkdownEditor'
// import AssetSidebar from '@/components/AssetSidebar'
// import NotesSidebar from '@/components/NotesSidebar'
// import EditableTitle from '@/components/EditableTitle'
import StatusProcessFlow from '@/components/StatusProcessFlow'

function ProjectPageContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = params.projectId as string
  
  const view = searchParams.get('view') || 'notes'
  
  const [project, setProject] = useState<Project | null>(null)
  const [, setNotes] = useState<ProjectNote[]>([])
  const [currentNote, setCurrentNote] = useState('')
  const [assets, setAssets] = useState<Asset[]>([])
  const [featureSets, setFeatureSets] = useState<FeatureSet[]>([])
  const [prdNotes, setPrdNotes] = useState<PRDNote[]>([])
  const [featureSetsNotes, setFeatureSetsNotes] = useState<PRDNote[]>([])
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(true)
  const [isProcessingPRD, setIsProcessingPRD] = useState(false)
  const [isProcessingFeatureSets, setIsProcessingFeatureSets] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load core project data first
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

        // Load PRD notes separately - don't fail if table doesn't exist yet
        try {
          const [prdNotesData, featureSetsNotesData] = await Promise.all([
            getPRDNotesByProject(projectId, PRDNoteContext.PRD),
            getPRDNotesByProject(projectId, PRDNoteContext.FEATURE_SETS),
          ])
          setPrdNotes(prdNotesData)
          setFeatureSetsNotes(featureSetsNotesData)
        } catch (prdNotesError) {
          // If PRD notes table doesn't exist yet, just log and continue
          console.warn('PRD notes table may not exist yet:', prdNotesError)
          setPrdNotes([])
          setFeatureSetsNotes([])
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
      // TODO: Properly type the type parameter when this function is fully implemented
      await createAsset(projectId, type as AssetType, source, annotation)
      const updatedAssets = await getAssetsByProject(projectId)
      setAssets(updatedAssets)
    } catch (error) {
      console.error('Failed to add asset:', error)
    }
  }

  const handleAddPRDNote = async (content: string) => {
    if (!projectId) return
    
    try {
      await createPRDNote(projectId, PRDNoteContext.PRD, content)
      const updatedNotes = await getPRDNotesByProject(projectId, PRDNoteContext.PRD)
      setPrdNotes(updatedNotes)
    } catch (error) {
      console.error('Failed to add PRD note:', error)
    }
  }

  const handleAddFeatureSetsNote = async (content: string) => {
    if (!projectId) return
    
    try {
      await createPRDNote(projectId, PRDNoteContext.FEATURE_SETS, content)
      const updatedNotes = await getPRDNotesByProject(projectId, PRDNoteContext.FEATURE_SETS)
      setFeatureSetsNotes(updatedNotes)
    } catch (error) {
      console.error('Failed to add feature sets note:', error)
    }
  }

  const handleRerunPRD = async () => {
    if (!projectId) return
    
    setIsProcessingPRD(true)
    try {
      // TODO: Implement actual PRD processing logic here
      // For now, we'll just mark notes as triaged
      await markPRDNotesAsTriaged(projectId, PRDNoteContext.PRD)
      const updatedNotes = await getPRDNotesByProject(projectId, PRDNoteContext.PRD)
      setPrdNotes(updatedNotes)
    } catch (error) {
      console.error('Failed to re-run PRD:', error)
    } finally {
      setIsProcessingPRD(false)
    }
  }

  const handleRerunFeatureSets = async () => {
    if (!projectId) return
    
    setIsProcessingFeatureSets(true)
    try {
      // TODO: Implement actual feature sets processing logic here
      // For now, we'll just mark notes as triaged
      await markPRDNotesAsTriaged(projectId, PRDNoteContext.FEATURE_SETS)
      const updatedNotes = await getPRDNotesByProject(projectId, PRDNoteContext.FEATURE_SETS)
      setFeatureSetsNotes(updatedNotes)
    } catch (error) {
      console.error('Failed to re-run feature sets:', error)
    } finally {
      setIsProcessingFeatureSets(false)
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
              {/* TODO: Uncomment when EditableTitle component is implemented */}
              {project.name}
              {/* <EditableTitle
                projectId={projectId}
                initialValue={project.name}
                onUpdate={handleProjectUpdate}
                className="text-3xl font-bold"
              /> */}
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
              {/* TODO: Uncomment when MarkdownEditor component is implemented */}
              <textarea
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                className="w-full min-h-[400px] rounded-lg border border-gray-300 p-4"
                placeholder="Add notes here..."
              />
              <button
                onClick={handleSaveNote}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Save Note
              </button>
              {/* <MarkdownEditor
                value={currentNote}
                onChange={setCurrentNote}
                onSave={handleSaveNote}
                preview={false}
              /> */}
            </div>
          )}

          {view === 'prd' && (
            <div className="p-8">
              {/* TODO: Uncomment when MarkdownEditor component is implemented */}
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap">{summary || 'No PRD content yet'}</pre>
              </div>
              {/* <MarkdownEditor
                value={summary}
                onChange={setSummary}
                onSave={() => {}}
                preview={true}
              /> */}
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

      {/* TODO: Uncomment when AssetSidebar component is implemented */}
      {/* Asset Sidebar - only show in notes view */}
      {/* {view === 'notes' && (
        <AssetSidebar
          assets={assets}
          onAddAsset={handleAddAsset}
        />
      )} */}

      {/* TODO: Uncomment when NotesSidebar component is implemented */}
      {/* Notes Sidebar - show in prd and features views */}
      {/* {view === 'prd' && (
        <NotesSidebar
          notes={prdNotes}
          context={PRDNoteContext.PRD}
          onAddNote={handleAddPRDNote}
          onRerunPRD={handleRerunPRD}
          isProcessing={isProcessingPRD}
        />
      )}

      {view === 'features' && (
        <NotesSidebar
          notes={featureSetsNotes}
          context={PRDNoteContext.FEATURE_SETS}
          onAddNote={handleAddFeatureSetsNote}
          onRerunPRD={handleRerunFeatureSets}
          isProcessing={isProcessingFeatureSets}
        />
      )} */}
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

