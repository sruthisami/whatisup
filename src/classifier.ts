import { sendWhatsApp, sendWhatsAppImage, sendWhatsAppDocument } from './whatsapp'

// in-memory call log keyed by call id
const callLog: Record<string, any> = {}

export async function handleClassifyIntent(params: any): Promise<string> {
  const intent = params?.intent || 'warm'
  const reason = params?.reason || ''
  const business = params?.business_type || 'their business'
  const callId = params?.call_id || Date.now().toString()

  callLog[callId] = { intent, reason, business, ...params }

  console.log('=== classify intent ===')
  console.log(`intent: ${intent} | reason: ${reason}`)

  if (intent === 'hot') {
    const message = buildMidCallMessage(business, reason)

    console.log('=== mid-call whatsapp trigger ===')
    console.log(`message:\n${message}`)

    // fire-and-forget so the tool call returns to OmniDimension immediately
    // and the voice conversation is never blocked waiting on WhatsApp
    sendWhatsApp(process.env.TARGET_NUMBER, message).catch(console.error)

    return `classified as hot. whatsapp firing to customer.`
  }

  return `classified as ${intent}. logged.`
}

export async function handleScheduleCallback(params: any): Promise<string> {
  const rawTime = params?.requested_time_raw || ''
  const parsed = params?.parsed_datetime || ''

  console.log('=== schedule callback ===')
  console.log(`raw: ${rawTime} | parsed ist: ${parsed}`)

  const confirm =
    `hi, this is priya from elevatebox.\n\n` +
    `confirmed your callback for ${rawTime}.\n\n` +
    `talk soon.`

  sendWhatsApp(process.env.TARGET_NUMBER, confirm).catch(console.error)

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

  console.log('=== end call ===')
  console.log(`final intent: ${params?.final_intent}`)
  console.log(`budget: ${params?.budget}`)
  console.log(`timeline: ${params?.timeline}`)
  console.log(`products: ${params?.products}`)
  console.log(`features: ${params?.features_requested}`)
  console.log(`callback booked: ${params?.callback_booked}`)
  console.log(`callback time: ${params?.callback_time}`)
  console.log('=== post-call whatsapp message ===')
  console.log(message)

  // send the personalized follow-up text
  sendWhatsApp(process.env.TARGET_NUMBER, message).catch(console.error)

  // send architecture image
  if (archImageUrl) {
    sendWhatsAppImage(process.env.TARGET_NUMBER, archImageUrl, 'architecture diagram').catch(
      console.error
    )
  }

  // send resume — as a document, not an image, since it's a PDF
  if (resumeUrl) {
    sendWhatsAppDocument(
      process.env.TARGET_NUMBER,
      resumeUrl,
      'Vaishnavi_Resume.pdf',
      'my resume'
    ).catch(console.error)
  }

  return 'post-call summary sent.'
}

function buildMidCallMessage(business: string, reason: string): string {
  const yourPhone = process.env.YOUR_PHONE || 'your number'
  return (
    `hi, this is priya from elevatebox.\n\n` +
    `we were just speaking and i wanted to reach out right away.\n\n` +
    `${reason}\n\n` +
    `i will send you everything after our call.\n\n` +
    `priya, elevatebox hyderabad\n` +
    `${yourPhone}`
  )
}