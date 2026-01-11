// Route constants and navigation helpers

export const routes = {
  home: '/',
  project: (projectId: string, view: 'notes' | 'prd' = 'notes') => `/projects/${projectId}?view=${view}`,
  projectConcept: (projectId: string) => `/projects/${projectId}?view=notes`,
  projectPRD: (projectId: string) => `/projects/${projectId}?view=prd`,
  miniPRD: (projectId: string, miniPRDId: string) => `/projects/${projectId}/prd/${miniPRDId}`,
} as const

export function isActiveRoute(currentPath: string, route: string): boolean {
  return currentPath === route || currentPath.startsWith(route + '/')
}

