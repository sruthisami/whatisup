import axios from 'axios'

const INSTANCE = process.env.GREEN_API_INSTANCE
const TOKEN = process.env.GREEN_API_TOKEN

export async function sendWhatsApp(to: string, message: string): Promise<boolean> {
  // skipping as green api is not configured
  if (!INSTANCE || !TOKEN) {
    console.log('whatsapp not configured, skipping send')
    return false
  }

  const url = `https://7107.api.greenapi.com/waInstance${INSTANCE}/sendMessage/${TOKEN}`

  try {
    const resp = await axios.post(url, {
      chatId: `${to}@c.us`,
      message
    })
    console.log(`whatsapp sent to ${to}: status ${resp.status}`)
    return resp.status === 200
  } catch (error) {
    console.error('whatsapp send failed:', error)
    return false
  }
}