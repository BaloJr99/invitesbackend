export const getUTCDate = (): string => {
  // Get current date
  const localDate = new Date().toISOString()

  // Format UTC to YYYY-MM-DD HH:mm:ss format
  return localDate.slice(0, 19).replace('T', ' ').replace('Z', '')
}
