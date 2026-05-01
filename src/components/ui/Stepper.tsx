interface StepperStep {
  step: string
  titulo: string
  descricao: string
}

interface StepperProps {
  steps: readonly StepperStep[]
}

export default function Stepper({ steps }: StepperProps) {
  return (
    <ol className="flex flex-col md:flex-row gap-0 md:gap-0 list-none">
      {steps.map(({ step, titulo, descricao }, i) => (
        <li
          key={step}
          className={`flex-1 flex flex-col items-center text-center relative ${
            i < steps.length - 1 ? 'stepper-connector-v md:stepper-connector-h' : ''
          }`}
        >
          <div
            className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center shrink-0 z-10 relative"
            aria-hidden="true"
          >
            {step}
          </div>
          <div className="mt-4 px-2">
            <h3 className="font-semibold text-gray-900 mb-2">{titulo}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{descricao}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
