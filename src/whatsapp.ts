import axios from 'axios'


const PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN
const API_VERSION = process.env.META_API_VERSION || 'v25.0'

const BASE_URL = PHONE_NUMBER_ID
  ? `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`
  : ''


function resolveRecipient(customerNumber: string | undefined): string {
  const demoMode = (process.env.DEMO_MODE || 'true').toLowerCase() === 'true'
  const demoRecipient = process.env.DEMO_RECIPIENT

  if (demoMode && demoRecipient) {
    return demoRecipient
  }
  return customerNumber || process.env.TARGET_NUMBER || ''
}

function normalizeNumber(num: string): string {
  return num.replace(/[^\d]/g, '')
}

export async function sendWhatsApp(
  to: string | undefined,
  message: string
): Promise<boolean> {
  const recipient = resolveRecipient(to)

  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    console.log('=== whatsapp not configured, skipping send ===')
    console.log(`would send to: ${recipient}`)
    console.log(`message:\n${message}`)
    return false
  }

  if (!recipient) {
    console.log('whatsapp send skipped: no recipient resolved')
    return false
  }

  const payload = {
    messaging_product: 'whatsapp',
    to: normalizeNumber(recipient),
    type: 'text',
    text: { body: message },
  }

  try {
    const resp = await axios.post(BASE_URL, payload, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })
    console.log(`=== whatsapp sent ===`)
    console.log(`to: ${recipient}`)
    console.log(`status: ${resp.status}`)
    return resp.status === 200
  } catch (error: any) {
    console.error('=== whatsapp send failed ===')
    console.error(error?.response?.data || error.message)
    return false
  }
}

export async function sendWhatsAppImage(
  to: string | undefined,
  imageUrl: string,
  caption: string
): Promise<boolean> {
  const recipient = resolveRecipient(to)

  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    console.log('=== whatsapp not configured, skipping image send ===')
    console.log(`would send to: ${recipient}`)
    console.log(`image: ${imageUrl}`)
    console.log(`caption: ${caption}`)
    return false
  }

  if (!recipient) {
    console.log('whatsapp image send skipped: no recipient resolved')
    return false
  }

  
  const payload = {
    messaging_product: 'whatsapp',
    to: normalizeNumber(recipient),
    type: 'image',
    image: {
      link: imageUrl,
      caption: caption,
    },
  }

  try {
    const resp = await axios.post(BASE_URL, payload, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })
    console.log(`=== whatsapp image sent ===`)
    console.log(`to: ${recipient}`)
    console.log(`status: ${resp.status}`)
    return resp.status === 200
  } catch (error: any) {
    console.error('=== whatsapp image send failed ===')
    console.error(error?.response?.data || error.message)
    return false
  }
}

export async function sendWhatsAppDocument(
  to: string | undefined,
  docUrl: string,
  filename: string,
  caption?: string
): Promise<boolean> {
  const recipient = resolveRecipient(to)

  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    console.log('=== whatsapp not configured, skipping document send ===')
    console.log(`would send to: ${recipient}`)
    console.log(`document: ${docUrl}`)
    return false
  }

  if (!recipient) {
    console.log('whatsapp document send skipped: no recipient resolved')
    return false
  }

  const payload = {
    messaging_product: 'whatsapp',
    to: normalizeNumber(recipient),
    type: 'document',
    document: {
      link: docUrl,
      filename,
      ...(caption ? { caption } : {}),
    },
  }

  try {
    const resp = await axios.post(BASE_URL, payload, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })
    console.log(`=== whatsapp document sent ===`)
    console.log(`to: ${recipient}`)
    console.log(`status: ${resp.status}`)
    return resp.status === 200
  } catch (error: any) {
    console.error('=== whatsapp document send failed ===')
    console.error(error?.response?.data || error.message)
    return false
  }
}