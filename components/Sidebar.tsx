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

  const ProjectGroup = ({ title, projects, phase }: { title: string; projects: Project[]; phase: ProjectPhase }) => {
    const isActive = pathname?.startsWith(`/projects/`) && 
      projects.some(p => pathname.includes(p.id))
    
    return (
      <div className="mb-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {title}
        </h3>
        {projects.length === 0 ? (
          <p className="px-4 text-xs text-gray-400 dark:text-gray-500">No projects</p>
        ) : (
          <ul className="space-y-1">
            {projects.map((project) => {
              const isCurrentProject = pathname?.includes(project.id)
              return (
                <li key={project.id}>
                  <Link
                    href={`/projects/${project.id}/concept`}
                    className={`block rounded-lg px-4 py-2 text-sm transition-colors ${
                      isCurrentProject
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    {project.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    )
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 border-r border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 overflow-y-auto">
      <nav className="flex flex-col gap-4">
        <Link
          href="/"
          className={`rounded-lg px-4 py-2 transition-colors ${
            pathname === '/'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          }`}
        >
          Dashboard
        </Link>

        {loading ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">Loading projects...</div>
        ) : (
          <>
            <ProjectGroup title="Active" projects={activeProjects} phase={ProjectPhase.PRD} />
            <ProjectGroup title="Planned" projects={plannedProjects} phase={ProjectPhase.CONCEPT} />
            <ProjectGroup title="Completed" projects={completedProjects} phase={ProjectPhase.COMPLETED} />
          </>
        )}
      </nav>
    </aside>
  )
}

