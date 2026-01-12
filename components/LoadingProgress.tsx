'use client'

interface LoadingProgressProps {
  currentStep: string
  steps: string[]
  currentStepIndex: number
}

export default function LoadingProgress({ currentStep, steps, currentStepIndex }: LoadingProgressProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Generating PRD and Tasks</h3>
        <p className="text-sm text-gray-600">{currentStep}</p>
      </div>
      
      <div className="space-y-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          
          return (
            <div key={index} className="flex items-center gap-3">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span
                className={`text-sm ${
                  isCompleted
                    ? 'text-gray-500 line-through'
                    : isCurrent
                    ? 'font-medium text-gray-900'
                    : 'text-gray-400'
                }`}
              >
                {step}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

