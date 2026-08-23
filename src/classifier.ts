import { sendWhatsApp, sendWhatsAppImage } from './whatsapp'

// in-memory call log keyed by call id
const callLog: Record<string, any> = {}

export async function handleClassifyIntent(params: any): Promise<string> {
  const intent = params?.intent || 'warm'
  const reason = params?.reason || ''
  const business = params?.business_type || 'their business'
  const callId = params?.call_id || Date.now().toString()

  // store lead data
  callLog[callId] = { intent, reason, business, ...params }

  console.log(`intent: ${intent} | reason: ${reason}`)

  if (intent === 'hot') {
    const message = buildMidCallMessage(business, reason)
    // fire whatsapp without awaiting so the call does not pause
    sendWhatsApp(process.env.TARGET_NUMBER!, message).catch(console.error)
    return `classified as hot. whatsapp firing to customer.`
  }

  return `classified as ${intent}. logged.`
}

export async function handleScheduleCallback(params: any): Promise<string> {
  const rawTime = params?.requested_time_raw || ''
  const parsed = params?.parsed_datetime || ''

  console.log(`callback: ${rawTime} -> ${parsed}`)

  const confirm = `hi, this is priya from elevatebox. confirmed your callback for ${rawTime}. talk soon.`
  sendWhatsApp(process.env.TARGET_NUMBER!, confirm).catch(console.error)

  return `callback booked for ${parsed}. confirmation sent.`
}

export async function handleEndCall(params: any): Promise<string> {
  const yourName = process.env.YOUR_NAME || 'your name'
  const yourPhone = process.env.YOUR_PHONE || 'your number'
  const archImageUrl = process.env.ARCH_IMAGE_URL || ''
  const resumeUrl = process.env.RESUME_URL || ''

  const body = params?.summary || ''

  const message =
    `${body}\n\n` +
    `${yourName}\n` +
    `elevatebox, hyderabad\n` +
    `${yourPhone}`

  // send text message
  sendWhatsApp(process.env.YOUR_WHATSAPP!, message).catch(console.error)
  sendWhatsApp(process.env.TARGET_NUMBER!, message).catch(console.error)

  // send architecture image
  if (archImageUrl) {
    sendWhatsAppImage(process.env.YOUR_WHATSAPP!, archImageUrl, 'architecture diagram').catch(console.error)
    sendWhatsAppImage(process.env.TARGET_NUMBER!, archImageUrl, 'architecture diagram').catch(console.error)
  }

  // send resume
  if (resumeUrl) {
    sendWhatsAppImage(process.env.YOUR_WHATSAPP!, resumeUrl, 'resume').catch(console.error)
    sendWhatsAppImage(process.env.TARGET_NUMBER!, resumeUrl, 'resume').catch(console.error)
  }

  return 'post-call summary sent.'
}

function buildMidCallMessage(business: string, reason: string): string {
  const yourPhone = process.env.PHONE || 'your number'
  return (
    `hi, this is priya from elevatebox.\n\n` +
    `we were just speaking and i wanted to reach out right away.\n\n` +
    `${reason}\n\n` +
    `i will send you everything after our call.\n\n` +
    `priya, elevatebox hyderabad\n` +
    `${yourPhone}`
  )
}