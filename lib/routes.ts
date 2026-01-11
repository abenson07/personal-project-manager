// Route constants and navigation helpers

export const routes = {
  home: '/',
  projectConcept: (projectId: string) => `/projects/${projectId}/concept`,
  projectPRD: (projectId: string) => `/projects/${projectId}/prd`,
  miniPRD: (projectId: string, miniPRDId: string) => `/projects/${projectId}/prd/${miniPRDId}`,
} as const

export function isActiveRoute(currentPath: string, route: string): boolean {
  return currentPath === route || currentPath.startsWith(route + '/')
}

