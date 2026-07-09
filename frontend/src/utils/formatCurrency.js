/**
 * Formats a number as Pakistani Rupees, e.g. 128450.5 -> "PKR 128,450.50"
 */
export function formatPKR(amount) {
  const value = Number(amount) || 0;
  return `PKR ${value.toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}