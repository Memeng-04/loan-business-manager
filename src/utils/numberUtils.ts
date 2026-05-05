/**
 * Sanitizes number input – only non-negative, max two decimals, and enforces a maximum limit.
 * Useful for currency/money inputs.
 */
export const sanitizeNumber = (rawValue: string, max = 1_000_000_000): string => {
  // Allow empty input
  if (rawValue === "") return "";

  // Remove everything except digits and a single decimal point
  let cleaned = rawValue.replace(/[^\d.]/g, "");
  let parts = cleaned.split(".");
  if (parts.length > 2) {
    // Keep only the first decimal point
    cleaned = parts[0] + "." + parts.slice(1).join("");
    parts = cleaned.split(".");
  }

  // Limit decimal places to 2
  if (parts.length === 2 && parts[1].length > 2) {
    cleaned = parts[0] + "." + parts[1].slice(0, 2);
  }

  // Parse as number to check limits
  const num = parseFloat(cleaned);
  if (isNaN(num)) {
    // If it's just a dot, let it stay for typing experience
    if (cleaned === ".") return "0.";
    return "";
  }

  // No negatives (already handled by regex but for safety)
  if (num < 0) return "0";

  // Enforce max limit
  if (num > max) return max.toString();

  // Return the cleaned string (preserve user's decimal format while typing)
  return cleaned;
};
