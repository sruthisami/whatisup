import { sendWhatsApp, sendWhatsAppImage, sendWhatsAppDocument } from './whatsapp'

// treats "NA", empty, null and undefined as "not provided"
function val(raw: any): string | null {
  if (raw === null || raw === undefined) return null
  const s = String(raw).trim()
  if (!s) return null
  if (s.toLowerCase() === 'na' || s.toLowerCase() === 'n/a') return null
  if (s.toLowerCase() === 'not provided') return null
  return s
}

export async function handlePostCall(body: any): Promise<void> {
  const report = body?.call_report || {}
  const vars = report?.extracted_variables || {}

  const businessType = val(vars.business_type)
  const onlinePresence = val(vars.current_online_presence)
  const productCount = val(vars.product_count)
  const featuresNeeded = val(vars.features_needed)
  const budgetRange = val(vars.budget_range)
  const timeline = val(vars.timeline)
  const decisionMaker = val(vars.decision_maker)
  const leadIntent = val(vars.lead_intent)
  const callbackRaw = val(vars.callback_time_raw)
  const callbackIso = val(vars.callback_time_iso)

  console.log('=== POST-CALL ===')
  console.log(`call id: ${body?.call_id} | status: ${body?.call_status} | duration: ${body?.call_duration}s`)
  console.log(`hangup source: ${body?.hangup_source} | sentiment: ${report?.sentiment}`)
  console.log('--- extracted ---')
  console.log(`intent:      ${leadIntent || '(not captured)'}`)
  console.log(`business:    ${businessType || '(not captured)'}`)
  console.log(`online now:  ${onlinePresence || '(not captured)'}`)
  console.log(`products:    ${productCount || '(not captured)'}`)
  console.log(`features:    ${featuresNeeded || '(not captured)'}`)
  console.log(`budget:      ${budgetRange || '(not captured)'}`)
  console.log(`timeline:    ${timeline || '(not captured)'}`)
  console.log(`decides:     ${decisionMaker || '(not captured)'}`)
  console.log(`callback:    ${callbackRaw || '(none)'} -> ${callbackIso || '(none)'}`)
  console.log('--- summary ---')
  console.log(report?.summary || '(no summary)')

  // don't follow up on calls that never really happened
  if (body?.call_status && body.call_status !== 'completed') {
    console.log(`skipping follow-up — call status is "${body.call_status}"`)
    return
  }

  const message = buildFollowUp({
    businessType,
    onlinePresence,
    productCount,
    featuresNeeded,
    budgetRange,
    timeline,
    callbackRaw,
  })

  console.log('--- follow-up message ---')
  console.log(message)

  const archImageUrl = process.env.ARCH_IMAGE_URL || ''
  const resumeUrl = process.env.RESUME_URL || ''

  // text first, then attachments — order matters for how it reads on the phone
  await sendWhatsApp(process.env.TARGET_NUMBER, message)

  if (archImageUrl) {
    await sendWhatsAppImage(
      process.env.TARGET_NUMBER,
      archImageUrl,
      'how this system is built'
    )
  }

  if (resumeUrl) {
    await sendWhatsAppDocument(
      process.env.TARGET_NUMBER,
      resumeUrl,
      'Sruthi_Resume.pdf',
      'my resume'
    )
  }

  console.log('=== POST-CALL COMPLETE ===')
}

interface FollowUpParts {
  businessType: string | null
  onlinePresence: string | null
  productCount: string | null
  featuresNeeded: string | null
  budgetRange: string | null
  timeline: string | null
  callbackRaw: string | null
}

function buildFollowUp(p: FollowUpParts): string {
  const yourName = process.env.YOUR_NAME || 'Sruthi'
  const yourPhone = process.env.YOUR_PHONE || ''

  const lines: string[] = []

  lines.push(`hi, this is priya from elevatebox.`)
  lines.push(`thanks for taking the time to speak with me just now.`)

  // recap built only from what was actually captured
  const recap: string[] = []

  if (p.businessType) {
    recap.push(
      p.productCount
        ? `you sell ${p.businessType}, with around ${p.productCount}`
        : `you sell ${p.businessType}`
    )
  } else if (p.productCount) {
    recap.push(`you have around ${p.productCount}`)
  }

  if (p.onlinePresence) recap.push(p.onlinePresence.toLowerCase())
  if (p.featuresNeeded) recap.push(`you're looking for ${p.featuresNeeded}`)
  if (p.budgetRange) recap.push(`working with a budget of around ${p.budgetRange}`)
  if (p.timeline) recap.push(`hoping to go live ${p.timeline}`)

  if (recap.length) {
    lines.push(`just so it's written down — ${recap.join(', ')}.`)
  }

  if (p.callbackRaw) {
    lines.push(`i'll call you back ${p.callbackRaw} as agreed.`)
  }

  lines.push(
    `i've attached a diagram of how i built this system, and my resume.`
  )

  lines.push([yourName, `elevatebox, hyderabad`, yourPhone].filter(Boolean).join('\n'))

  return lines.join('\n\n')
}