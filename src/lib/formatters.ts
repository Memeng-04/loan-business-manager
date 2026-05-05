/**
 * Centralized formatting utilities to avoid code duplication
 */

/**
 * Format a number as Philippine peso currency
 * @param value - Number to format
 * @returns Formatted currency string with ₱ symbol
 */
export const formatCurrency = (value: number): string => {
  return `₱${value.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

/**
 * Format a number with thousand separators and 2 decimal places
 * @param value - Number to format
 * @returns Formatted number string
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/**
 * Format a date to en-PH locale
 * @param dateString - Date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Validate if a value is a valid currency (must be > 0)
 * @param value - Value to validate
 * @returns true if valid, false otherwise
 */
export const isValidCurrency = (value: string): boolean => {
  if (value === '' || value === '0') return true
  // Strip commas and spaces
  const sanitized = value.replace(/[\s,]/g, '')
  if (!/^\d+(\.\d{0,2})?$/.test(sanitized)) return false
  return parseFloat(sanitized) >= 0
}

/**
 * Validate if a value is a valid positive integer (must be > 0)
 * @param value - Value to validate
 * @returns true if valid, false otherwise
 */
export const isValidPositiveInteger = (value: string): boolean => {
  if (value === '' || value === '0') return true
  // Strip commas and spaces
  const sanitized = value.replace(/[\s,]/g, '')
  if (!/^\d+$/.test(sanitized)) return false
  return parseInt(sanitized, 10) >= 0
}
