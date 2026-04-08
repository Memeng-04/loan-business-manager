import React from 'react'
import type { WizardStepProps } from '../../../types/wizardTypes'
import { PieChart, TrendingUp } from 'lucide-react'

/**
 * Step 1: Loan Type Selection
 * User selects between Fixed Interest, Simple Interest, or Interest Only Loan.
 * Clicking a card updates state and immediately advances to Step 2.
 */
export const Step1LoanCategory: React.FC<WizardStepProps> = ({
  state,
  updateState,
  nextStep,
  isLoading
}) => {
  const loanOptions = [
    {
      id: 'fixed',
      title: 'Fixed Interest',
      description:
        'Borrow a fixed amount and repay with a set total payable. Interest is predetermined and does not change.',
      icon: PieChart
    },
    {
      id: 'percentage',
      title: 'Percentage Interest',
      description:
        'Borrow at a percentage interest rate. Interest is calculated based on principal and time period.',
      icon: TrendingUp
    }
  ] as const

  const handleSelectLoan = (loanType: 'fixed' | 'percentage') => {
    updateState('loanType', loanType)
    nextStep()
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Section Title */}
      <div>
        <h3 className="text-lg font-bold text-[#012a6a] mb-2">
          Select Your Loan Type
        </h3>
        <p className="text-sm text-gray-600">
          Choose the loan structure that best fits your needs.
        </p>
      </div>

      {/* Loan Type Cards */}
      <div className="grid grid-cols-1 gap-4">
        {loanOptions.map(option => (
          <button
            key={option.id}
            onClick={() => handleSelectLoan(option.id)}
            disabled={isLoading}
            className={`p-4 rounded-2xl border-2 transition-all text-left ${
              state.loanType === option.id
                ? 'border-[#112bd6] bg-blue-50'
                : 'border-gray-200 bg-white hover:border-[#112bd6] hover:bg-blue-50'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <option.icon className="w-6 h-6 text-teal-600 group-hover:text-teal-500" />
                  <div className="font-bold text-gray-800 group-hover:text-teal-600">{option.title}</div>
                </div>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all ${
                    state.loanType === option.id
                      ? 'border-[#112bd6] bg-[#112bd6]'
                      : 'border-gray-300'
                  }`}
                >
                  {state.loanType === option.id && (
                    <span className="text-white text-sm font-bold">✓</span>
                  )}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-[#6db6fe] rounded-2xl p-4">
        <p className="text-xs text-[#012a6a] font-medium">
          💡 Tip: You can change your loan type even after selecting it, or
          proceed with one for now.
        </p>
      </div>
    </div>
  )
}
