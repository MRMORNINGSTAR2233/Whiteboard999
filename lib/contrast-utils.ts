/**
 * Utility functions for calculating color contrast and determining appropriate text colors
 */

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null
}

/**
 * Calculate relative luminance of a color
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) return 1

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)

  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)

  return (brightest + 0.05) / (darkest + 0.05)
}

/**
 * Determine if a background color is light or dark
 */
export function isLightColor(color: string): boolean {
  const rgb = hexToRgb(color)
  if (!rgb) return false

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b)
  return luminance > 0.5
}

/**
 * Get appropriate text color (black or white) for a given background color
 * Ensures WCAG AA compliance (4.5:1 contrast ratio)
 */
export function getContrastingTextColor(backgroundColor: string): string {
  const whiteContrast = getContrastRatio(backgroundColor, "#ffffff")
  const blackContrast = getContrastRatio(backgroundColor, "#000000")

  // Return the color with better contrast, preferring white if both are acceptable
  if (whiteContrast >= 4.5) return "#ffffff"
  if (blackContrast >= 4.5) return "#000000"

  // If neither meets WCAG AA, return the one with better contrast
  return whiteContrast > blackContrast ? "#ffffff" : "#000000"
}

/**
 * Get text color with fallback for edge cases
 */
export function getSafeTextColor(backgroundColor: string, fallback = "#000000"): string {
  try {
    return getContrastingTextColor(backgroundColor)
  } catch {
    return fallback
  }
}
