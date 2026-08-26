import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { handleClassifyIntent, handleScheduleCallback, handleEndCall } from './classifier'

dotenv.config()

const app = express()

app.use(express.json())
app.use(cors())
app.use('/public', express.static('assets'))

const PORT = process.env.PORT || 3000

// health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'running', timestamp: new Date().toISOString() })
})

app.get('/webhook', (req: Request, res: Response) => {
  res.json({ status: 'webhook ready' })
})

let lastPostCall: any = null

app.post('/post-call', (req: Request, res: Response) => {
  lastPostCall = { receivedAt: new Date().toISOString(), body: req.body }
  console.log('=== POST-CALL PAYLOAD ===')
  console.log(JSON.stringify(req.body, null, 2))
  res.json({ received: true })
})

app.get('/post-call/last', (req: Request, res: Response) => {
  res.json(lastPostCall || { message: 'nothing received yet' })
})

// omnidimension webhook — receives all tool calls mid-call
app.post('/webhook', async (req: Request, res: Response) => {
  const body = req.body
  const toolName = body?.tool_name || body?.name
  const params = body?.parameters || body?.input || body

  // responding immediately so agent does not stall
  res.json({ result: 'noted' })

  try {
    if (toolName === 'classifyIntent') {
      await handleClassifyIntent(params)
    } else if (toolName === 'scheduleCallback') {
      await handleScheduleCallback(params)
    } else if (toolName === 'endCall') {
      await handleEndCall(params)
    }
  } catch (error) {
    console.error('webhook error:', error)
  }
})

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})