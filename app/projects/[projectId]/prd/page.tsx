'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getProjectById, getFeatureSetsByProject } from '@/lib/database'
import type { Project, FeatureSet } from '@/types/database'
import MarkdownEditor from '@/components/MarkdownEditor'

export default function PRDPage() {
  const params = useParams()
  const projectId = params.projectId as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [featureSets, setFeatureSets] = useState<FeatureSet[]>([])
  const [activeTab, setActiveTab] = useState<'summary' | 'full' | 'features'>('summary')
  const [summary, setSummary] = useState('')
  const [fullPRD, setFullPRD] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectData, featureSetsData] = await Promise.all([
          getProjectById(projectId),
          getFeatureSetsByProject(projectId),
        ])
        
        setProject(projectData)
        setFeatureSets(featureSetsData)
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

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!project) {
    return <div className="p-8">Project not found</div>
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
        {project.name} - PRD
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
  )
}

