import React from 'react'
import styles from './SummaryCard.module.css'

interface SummaryCardItem {
  label?: string | React.ReactNode
  value: string | React.ReactNode
  isTotal?: boolean
}

interface SummaryCardProps {
  title: string | React.ReactNode
  icon?: React.ReactNode
  items: SummaryCardItem[]
  variant?: 'default' | 'payment'
}

/**
 * Reusable Summary Card component used across all wizard steps.
 * Displays a title, icon, and list of label-value pairs in a blue card.
 */
export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  icon,
  items,
  variant = 'default'
}) => {
  return (
    <div className={`${styles.summaryCard} ${variant === 'payment' ? styles.payment : ''}`}>
      <h4 className={styles.summaryCardTitle}>
        {icon && <span className={styles.summaryCardIcon}>{icon}</span>}
        {title}
      </h4>
      <div className={styles.summaryItems}>
        {items.map((item, index) => (
          <div
            key={index}
            className={`${styles.summaryItem} ${item.isTotal ? styles.totalItem : ''}`}
          >
            {item.label && (
              <span className={`${styles.summaryItemLabel} ${item.isTotal ? styles.totalLabel : ''}`}>
                {item.label}
              </span>
            )}
            <span className={`${styles.summaryItemValue} ${item.isTotal ? styles.totalValue : ''}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
