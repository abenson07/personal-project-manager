'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 border-r border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
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
      </nav>
    </aside>
  )
}

