// parses natural language time references into datetime strings
// omnidimension llm handles most parsing, this is a fallback layer

export function parseCallback(rawTime: string): string {
  const now = new Date()
  const lower = rawTime.toLowerCase()

  if (lower.includes('kal') || lower.includes('tomorrow') || lower.includes('repu') || lower.includes('next day')) {
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)
    return tomorrow.toISOString()
  }

  if (lower.includes('evening') || lower.includes('shaam') || lower.includes('sayantram')) {
    const evening = new Date(now)
    evening.setHours(18, 0, 0, 0)
    return evening.toISOString()
  }

  if (lower.includes('afternoon') || lower.includes('dopahar') || lower.includes('madhyahnam')) {
    const afternoon = new Date(now)
    afternoon.setHours(14, 0, 0, 0)
    return afternoon.toISOString()
  }

  if (lower.includes('morning') || lower.includes('subah') || lower.includes('udayam') || lower.includes('podhuna')) {
    const morning = new Date(now)
    morning.setHours(10, 0, 0, 0)
    return morning.toISOString()
  }

  // return raw if no pattern matched
  return rawTime
}