export const formatDate = (isoString: string): string => {
  try {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return isoString
  }
}

export const formatGpa = (gpa: number): string => {
  return gpa.toFixed(2)
}
