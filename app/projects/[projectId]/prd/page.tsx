'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { 
  getProjectById, 
  getFeatureSetsByProject,
  getPRDNotesByProject,
  createPRDNote,
  markPRDNotesAsTriaged
} from '@/lib/database'
import type { Project, FeatureSet, PRDNote } from '@/types/database'
import { PRDNoteContext } from '@/types/database'
import MarkdownEditor from '@/components/MarkdownEditor'
import EditableTitle from '@/components/EditableTitle'
import NotesSidebar from '@/components/NotesSidebar'

export default function PRDPage() {
  const params = useParams()
  const projectId = params.projectId as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [featureSets, setFeatureSets] = useState<FeatureSet[]>([])
  const [prdNotes, setPrdNotes] = useState<PRDNote[]>([])
  const [featureSetsNotes, setFeatureSetsNotes] = useState<PRDNote[]>([])
  const [activeTab, setActiveTab] = useState<'summary' | 'full' | 'features'>('summary')
  const [summary, setSummary] = useState('')
  const [fullPRD, setFullPRD] = useState('')
  const [loading, setLoading] = useState(true)
  const [isProcessingPRD, setIsProcessingPRD] = useState(false)
  const [isProcessingFeatureSets, setIsProcessingFeatureSets] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectData, featureSetsData, prdNotesData, featureSetsNotesData] = await Promise.all([
          getProjectById(projectId),
          getFeatureSetsByProject(projectId),
          getPRDNotesByProject(projectId, PRDNoteContext.PRD),
          getPRDNotesByProject(projectId, PRDNoteContext.FEATURE_SETS),
        ])
        
        setProject(projectData)
        setFeatureSets(featureSetsData)
        setPrdNotes(prdNotesData)
        setFeatureSetsNotes(featureSetsNotesData)
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

  const getCurrentNotes = () => {
    if (activeTab === 'features') {
      return featureSetsNotes
    }
    return prdNotes
  }

  const getCurrentContext = () => {
    if (activeTab === 'features') {
      return PRDNoteContext.FEATURE_SETS
    }
    return PRDNoteContext.PRD
  }

  const getCurrentAddHandler = () => {
    if (activeTab === 'features') {
      return handleAddFeatureSetsNote
    }
    return handleAddPRDNote
  }

  const getCurrentRerunHandler = () => {
    if (activeTab === 'features') {
      return handleRerunFeatureSets
    }
    return handleRerunPRD
  }

  const getCurrentIsProcessing = () => {
    if (activeTab === 'features') {
      return isProcessingFeatureSets
    }
    return isProcessingPRD
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
          <EditableTitle
            projectId={projectId}
            initialValue={project.name}
            onUpdate={handleProjectUpdate}
            className="text-3xl font-bold"
          />{' '}
          - PRD
        </h1>

        <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 ${
              activeTab === 'summary'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('full')}
            className={`px-4 py-2 ${
              activeTab === 'full'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Full PRD
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`px-4 py-2 ${
              activeTab === 'features'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Feature Sets
          </button>
        </div>

        {activeTab === 'summary' && (
          <div>
            <MarkdownEditor
              value={summary}
              onChange={setSummary}
              onSave={() => {}}
            />
          </div>
        )}

        {activeTab === 'full' && (
          <div>
            <MarkdownEditor
              value={fullPRD}
              onChange={setFullPRD}
              onSave={() => {}}
            />
          </div>
        )}

        {activeTab === 'features' && (
          <div>
            <h2 className="mb-4 text-xl font-semibold">Feature Sets</h2>
            {featureSets.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No feature sets yet</p>
            ) : (
              <div className="space-y-4">
                {featureSets.map((featureSet) => (
                  <div
                    key={featureSet.id}
                    className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {featureSet.name}
                    </h3>
                    {featureSet.description && (
                      <p className="mt-2 text-gray-600 dark:text-gray-400">
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
      <NotesSidebar
        notes={getCurrentNotes()}
        context={getCurrentContext()}
        onAddNote={getCurrentAddHandler()}
        onRerunPRD={getCurrentRerunHandler()}
        isProcessing={getCurrentIsProcessing()}
      />
    </div>
  )
}

