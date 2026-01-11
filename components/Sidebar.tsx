'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getProjectsByPhase } from '@/lib/database'
import type { Project } from '@/types/database'
import { ProjectPhase } from '@/types/database'

export default function Sidebar() {
  const pathname = usePathname()
  const [activeProjects, setActiveProjects] = useState<Project[]>([])
  const [plannedProjects, setPlannedProjects] = useState<Project[]>([])
  const [completedProjects, setCompletedProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [overviewExpanded, setOverviewExpanded] = useState(true)
  const [activeExpanded, setActiveExpanded] = useState(true)
  const [plannedExpanded, setPlannedExpanded] = useState(true)

  const loadProjects = async () => {
    try {
      const [active, planned, completed] = await Promise.all([
        getProjectsByPhase(ProjectPhase.PRD),
        getProjectsByPhase(ProjectPhase.CONCEPT),
        getProjectsByPhase(ProjectPhase.COMPLETED),
      ])
      
      setActiveProjects(active)
      setPlannedProjects(planned)
      setCompletedProjects(completed)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()

    // Listen for project updates
    const handleProjectUpdate = () => {
      loadProjects()
    }

    window.addEventListener('projectUpdated', handleProjectUpdate)
    
    // Also refresh when pathname changes (user navigates)
    if (pathname) {
      loadProjects()
    }

    return () => {
      window.removeEventListener('projectUpdated', handleProjectUpdate)
    }
  }, [pathname])

  const totalProjects = activeProjects.length + plannedProjects.length + completedProjects.length

  const ProjectGroup = ({ title, projects, phase, expanded, onToggle }: { title: string; projects: Project[]; phase: ProjectPhase; expanded: boolean; onToggle: () => void }) => {
    return (
      <div className="mb-4">
        <button
          onClick={onToggle}
          className="mb-2 flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-600"
        >
          <span>{title}</span>
          <svg
            className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expanded && (
          <>
            {projects.length === 0 ? (
              <p className="px-4 text-xs text-gray-400">No projects</p>
            ) : (
              <ul className="space-y-1">
                {projects.map((project) => {
                  const isCurrentProject = pathname?.includes(project.id)
                  return (
                    <li key={project.id}>
                      <Link
                        href={`/projects/${project.id}`}
                        className={`block rounded-lg px-4 py-2 text-sm transition-colors ${
                          isCurrentProject
                            ? 'bg-purple-100 text-purple-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {project.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-100 border-r border-gray-200 overflow-y-auto">
      <nav className="flex flex-col p-6">
        {/* Logo/Brand Area */}
        <div className="mb-8">
          <h1 className="text-lg font-semibold text-gray-900">Projects management</h1>
        </div>

        {/* OVERVIEW Section */}
        <div className="mb-6">
          <button
            onClick={() => setOverviewExpanded(!overviewExpanded)}
            className="mb-2 flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-600"
          >
            <span>OVERVIEW</span>
            <svg
              className={`h-4 w-4 transition-transform ${overviewExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {overviewExpanded && (
            <ul className="space-y-1">
              <li>
                <Link
                  href="/"
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
                    pathname === '/'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
                    pathname === '/'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  Projects
                  <span className="ml-auto rounded-full bg-purple-500 px-2 py-0.5 text-xs text-white">
                    {totalProjects}
                  </span>
                </Link>
              </li>
            </ul>
          )}
        </div>

        {/* Active Section */}
        {loading ? (
          <div className="text-sm text-gray-500">Loading projects...</div>
        ) : (
          <>
            <ProjectGroup
              title="Active"
              projects={activeProjects}
              phase={ProjectPhase.PRD}
              expanded={activeExpanded}
              onToggle={() => setActiveExpanded(!activeExpanded)}
            />
            <ProjectGroup
              title="Planned"
              projects={plannedProjects}
              phase={ProjectPhase.CONCEPT}
              expanded={plannedExpanded}
              onToggle={() => setPlannedExpanded(!plannedExpanded)}
            />
          </>
        )}

        {/* Completed Count */}
        <div className="mt-auto pt-6 text-xs text-gray-500">
          {completedProjects.length} completed
        </div>
      </nav>
    </aside>
  )
}

