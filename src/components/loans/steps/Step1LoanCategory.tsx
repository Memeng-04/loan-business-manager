import React from 'react'
import type { WizardStepProps } from '../../../types/wizardTypes'
import { PieChart, TrendingUp, Lightbulb } from 'lucide-react'
import Card from '../../card/Card'
import styles from './Step1LoanCategory.module.css'


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
    <div className={styles.stepContainer}>
      {/* Section Title */}
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>
          Select Your Loan Type
        </h3>
        <p className={styles.sectionDescription}>
          Choose the loan structure that best fits your needs.
        </p>
      </div>

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
      <div className={styles.infoBox}>
          <Lightbulb size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
          Tip: You can change your loan type even after selecting it, or
        proceed with one for now.
      </div>
    </div>
  )
}
