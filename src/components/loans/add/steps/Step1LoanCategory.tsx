import React from 'react'
import type { WizardStepProps } from '../../../../types/wizardTypes'
import { PieChart, TrendingUp, Lightbulb } from 'lucide-react'
import Card from '../../../card/Card'
import { InfoBox } from '../../InfoBox'
import styles from './Step1LoanCategory.module.css'


export const Step1LoanCategory: React.FC<WizardStepProps> = ({
  state,
  updateState,
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
  }

  return (
    <div className={styles.stepContainer}>
      {/* Loan Type Cards Grid - Uses responsive auto-fit CSS Grid */}
      <div className={styles.cardsGrid}>
        {loanOptions.map(option => {
          const isActive = state.loanType === option.id
          return (
            <button
              key={option.id}
              onClick={() => handleSelectLoan(option.id)}
              disabled={isLoading}
              className={`${styles.loanCardButton} ${
                isActive ? styles.active : ''
              }`}
            >
              <Card className={styles.loanCard} padding="lg">
                <div className={styles.loanCardContent}>
                  <option.icon className={styles.loanCardIcon} />
                  <div className={styles.loanCardText}>
                    <div className={styles.loanCardTitle}>{option.title}</div>
                    <p className={styles.loanCardDescription}>{option.description}</p>
                  </div>
                </div>
                <div className={styles.selectionRadio}>
                  {isActive && (
                    <span className={styles.selectionCheckmark}>✓</span>
                  )}
                </div>
              </Card>
            </button>
          )
        })}
      </div>

      {/* Info Box */}
      <InfoBox icon={<Lightbulb size={16} />}>
        Choose a loan type above to continue. You can change this later in the review step.
      </InfoBox>
    </div>
  )
}
