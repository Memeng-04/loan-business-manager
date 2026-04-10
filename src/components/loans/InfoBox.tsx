import React from 'react'
import styles from './InfoBox.module.css'

interface InfoBoxProps {
  icon?: React.ReactNode
  children: React.ReactNode
  variant?: 'default' | 'info'
}

/**
 * Reusable Info Box component used across all wizard steps.
 * Displays an icon and informational text in a light blue card.
 */
export const InfoBox: React.FC<InfoBoxProps> = ({
  icon,
  children,
  variant = 'default'
}) => {
  return (
    <div className={`${styles.infoBox} ${variant === 'info' ? styles.info : ''}`}>
      {icon && <span className={styles.infoIcon}>{icon}</span>}
      <span className={styles.infoText}>{children}</span>
    </div>
  )
}
