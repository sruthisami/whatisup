import { sendWhatsApp } from './whatsapp'

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
  const summary = params?.summary || ''
  const intent = params?.final_intent || 'warm'
  const budget = params?.budget || 'not discussed'
  const timeline = params?.timeline || 'not discussed'
  const products = params?.products || 'not mentioned'
  const features = params?.features_requested || 'general'
  const callbackBooked = params?.callback_booked || false
  const callbackTime = params?.callback_time || ''

  const yourName = process.env.YOUR_NAME || 'your name'
  const yourPhone = process.env.YOUR_PHONE || 'your number'

  const callbackLine = callbackBooked
    ? `callback booked: ${callbackTime}`
    : 'no callback scheduled'

  const message =
    `elevatebox call summary\n` +
    `----------------------\n` +
    `status: ${intent}\n` +
    `business: ${products}\n` +
    `budget: ${budget}\n` +
    `timeline: ${timeline}\n` +
    `features: ${features}\n` +
    `${callbackLine}\n` +
    `----------------------\n` +
    `what they said:\n` +
    `${summary}\n` +
    `----------------------\n` +
    `built by ${yourName}\n` +
    `${yourPhone}`

  // send to yourself
  sendWhatsApp(process.env.YOUR_WHATSAPP!, message).catch(console.error)

  // send to evaluator
  sendWhatsApp(process.env.TARGET_NUMBER!, message).catch(console.error)

  return 'post-call summary sent.'
}

function buildMidCallMessage(business: string, reason: string): string {
  return (
    `hi, this is priya from elevatebox.\n\n` +
    `we were just speaking about building an e-commerce website for ${business}.\n\n` +
    `${reason ? `i noticed ${reason} and wanted to reach out right away.\n\n` : ''}` +
    `i will send you our full details after our call.\n\n` +
    `priya, elevatebox`
  )
}