'use client'

import { useState } from 'react'
import type { Asset } from '@/types/database'
import { AssetType } from '@/types/database'

interface AssetSidebarProps {
  assets: Asset[]
  onAddAsset: (type: string, source: string, annotation?: string) => void
}

export default function AssetSidebar({ assets, onAddAsset }: AssetSidebarProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [assetType, setAssetType] = useState<AssetType>(AssetType.IMAGE)
  const [assetSource, setAssetSource] = useState('')
  const [assetAnnotation, setAssetAnnotation] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (assetSource.trim()) {
      onAddAsset(assetType, assetSource, assetAnnotation || undefined)
      setAssetSource('')
      setAssetAnnotation('')
      setShowAddForm(false)
    }
  }

  return (
    <aside className="w-80 border-l border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Assets</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
        >
          {showAddForm ? 'Cancel' : 'Add'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-4 space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <select
            value={assetType}
            onChange={(e) => setAssetType(e.target.value as AssetType)}
            className="w-full rounded border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700"
          >
            <option value={AssetType.IMAGE}>Image</option>
            <option value={AssetType.DOCUMENT}>Document</option>
            <option value={AssetType.LINK}>Link</option>
            <option value={AssetType.OTHER}>Other</option>
          </select>
          <input
            type="text"
            value={assetSource}
            onChange={(e) => setAssetSource(e.target.value)}
            placeholder="URL or file path"
            className="w-full rounded border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700"
            required
          />
          <textarea
            value={assetAnnotation}
            onChange={(e) => setAssetAnnotation(e.target.value)}
            placeholder="Annotation (optional)"
            className="w-full rounded border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700"
            rows={2}
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Add Asset
          </button>
        </form>
      )}

      <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
        {assets.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No assets yet</p>
        ) : (
          assets.map((asset) => (
            <div
              key={asset.id}
              className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {asset.type}
                </span>
              </div>
              <div className="mb-2 truncate text-sm text-gray-900 dark:text-gray-100">
                {asset.source}
              </div>
              {asset.annotation && (
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {asset.annotation}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  )
}

