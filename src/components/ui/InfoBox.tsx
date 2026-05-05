import React from 'react'
import { Info, Lightbulb } from 'lucide-react'
import styles from './InfoBox.module.css'

interface InfoBoxProps {
  icon?: React.ReactNode
  children: React.ReactNode
  variant?: 'default' | 'info' | 'lightbulb'
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
  const variantIcon =
    variant === 'info'
      ? <Info size={16} className="lucide lucide-info" />
      : variant === 'lightbulb'
        ? <Lightbulb size={16} className="lucide lucide-lightbulb" />
        : undefined

  const resolvedIcon = icon ?? variantIcon

  return (
    <div className={`${styles.infoBox} ${variant === 'info' ? styles.info : ''}`}>
      {resolvedIcon && <span className={styles.infoIcon}>{resolvedIcon}</span>}
      <span className={styles.infoText}>{children}</span>
    </div>
  )
}
