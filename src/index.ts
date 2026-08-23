import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import { handleClassifyIntent, handleScheduleCallback, handleEndCall } from './classifier'

dotenv.config()

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 3000

// health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'running', timestamp: new Date().toISOString() })
})

app.get('/webhook', (req: Request, res: Response) => {
  res.json({ status: 'webhook ready' })
})

// omnidimension webhook — receives all tool calls mid-call
app.post('/webhook', async (req: Request, res: Response) => {
  const body = req.body
  const toolName = body?.tool_name || body?.name
  const params = body?.parameters || body?.input || body

  console.log(`tool called: ${toolName}`)
  console.log(`params: ${JSON.stringify(params, null, 2)}`)

  try {
    if (toolName === 'classifyIntent') {
      const result = await handleClassifyIntent(params)
      res.json({ result })
    } else if (toolName === 'scheduleCallback') {
      const result = await handleScheduleCallback(params)
      res.json({ result })
    } else if (toolName === 'endCall') {
      const result = await handleEndCall(params)
      res.json({ result })
    } else {
      console.log(`unknown tool: ${toolName}`)
      res.json({ result: 'tool received' })
    }
  } catch (error) {
    // always return 200 so omnidimension does not retry
    console.error('webhook error:', error)
    res.status(200).json({ result: 'error handled' })
  }
})

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})