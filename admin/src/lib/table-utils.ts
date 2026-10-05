/**
 * Generates page-size dropdown options as multiples of 50.
 * Always starts at 50, then adds the next multiple until it exceeds
 * `total` by at most 50 (so there's always at least one option >= total).
 *
 * Examples:
 *   total = 32   →  [50, 100]
 *   total = 120  →  [50, 100, 150]
 *   total = 200  →  [50, 100, 150, 200, 250]
 */
export function generatePageSizeOptions(total: number): number[] {
  const step = 50
  const options: number[] = [step]
  let next = step * 2
  while (next <= total + step) {
    options.push(next)
    next += step
  }
  return options
}

/**
 * Generates a compact page-number array with ellipsis markers.
 * Example: [1, "...", 4, 5, 6, "...", 10]
 */
export function generatePageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | "...")[] = []

  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i)
    pages.push("...")
    pages.push(total)
  } else if (current >= total - 3) {
    pages.push(1)
    pages.push("...")
    for (let i = total - 4; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    pages.push("...")
    pages.push(current - 1)
    pages.push(current)
    pages.push(current + 1)
    pages.push("...")
    pages.push(total)
  }

  return pages
}
