import { sendWhatsApp, sendWhatsAppImage, sendWhatsAppDocument } from './whatsapp'

export async function handleClassifyIntent(params: any): Promise<string> {
  const intent = params?.intent || 'warm'
  const reason = params?.reason || ''
  const business = params?.business_type || 'their business'
  

  console.log('=== classify intent ===')
  console.log(`intent: ${intent} | reason: ${reason}`)

    if (intent === 'hot') {
    const message = buildMidCallMessage(business, reason)

    console.log('=== mid-call whatsapp trigger (hot) ===')
    console.log(`message:\n${message}`)

    sendWhatsApp(process.env.TARGET_NUMBER, message).catch(console.error)

    return `classified as hot. whatsapp firing to customer.`
  }

  if (intent === 'cold') {
    const message = buildColdInfoMessage()

    console.log('=== mid-call whatsapp trigger (cold) ===')
    console.log(`message:\n${message}`)

    sendWhatsApp(process.env.TARGET_NUMBER, message).catch(console.error)

    return `classified as cold. info message sent.`
  }

  return `classified as ${intent}. logged.`
}

export async function handleScheduleCallback(params: any): Promise<string> {
  const rawTime = params?.requested_time_raw || ''
  const parsed = params?.parsed_datetime || ''

  console.log('=== schedule callback ===')
  console.log(`raw: ${rawTime} | parsed ist: ${parsed}`)

  return `callback booked for ${parsed}.`
}

export async function handleEndCall(params: any): Promise<string> {
  const yourName = process.env.YOUR_NAME || 'your name'
  const yourPhone = process.env.YOUR_PHONE || 'your number'
  const archImageUrl = process.env.ARCH_IMAGE_URL || ''
  const resumeUrl = process.env.RESUME_URL || ''

  const body = params?.followup_message || params?.summary || ''
  const callbackBooked = (params?.callback_booked || '').toLowerCase()
  const callbackTime = params?.callback_time || ''

  const callbackLine =
    callbackBooked === 'yes' && callbackTime
      ? `just to confirm — i'll call you ${callbackTime}.\n\n`
      : ''

  const message =
    `${body}\n\n` +
    callbackLine +
    `${yourName}\n` +
    `elvoice, hyderabad\n` +
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
      'Sruthi_Resume.pdf',
      'my resume'
    ).catch(console.error)
  }

  return 'post-call summary sent.'
}

function buildMidCallMessage(business: string, reason: string): string {
  const yourPhone = process.env.YOUR_PHONE || 'your number'
  return (
    `hi, this is Sruthi from elvoice.\n\n` +
    `we're still on the call, but i wanted to send this across right away so you have it.\n\n` +
    `i'll put together the details for your ${business} and send everything over once we're done.\n\n` +
    `priya, elevatebox hyderabad\n` +
    `${yourPhone}`
  )
}

function buildColdInfoMessage(): string {
  const yourPhone = process.env.YOUR_PHONE || 'your number'
  return (
    `hi, this is Sruthi from elvoice.\n\n` +
    `thanks for your time on the call. we build custom e-commerce websites for businesses across india.\n\n` +
    `keeping this here in case you need it later — reach out anytime.\n\n` +
    `priya, elevatebox hyderabad\n` +
    `${yourPhone}`
  )
}