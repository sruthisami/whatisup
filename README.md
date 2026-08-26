# Elvoice — AI Voice Lead Qualification

An outbound voice agent that calls a lead, qualifies them in English, Hindi or Telugu, classifies intent, fires a WhatsApp mid-call on high intent, books a callback from spoken time, and follows up afterwards with the conversation context, a resume and an architecture diagram.

## Stack

| Layer | Choice |
|---|---|
| Voice | OmniDimension (outbound, office ambience) |
| Speech to text | Soniox |
| Language model | GPT-4o |
| Text to speech | Cartesia |
| Backend | Express + TypeScript on Railway |
| Messaging | Meta WhatsApp Cloud API |

## How it works

**During the call.** OmniDimension POSTs tool calls to `/webhook`. `index.ts` acknowledges instantly with `res.json()` before doing any work, so firing an action never adds latency to the conversation.

- `classifyIntent` — hot fires a WhatsApp immediately; cold sends an info message; warm is logged
- `scheduleCallback` — turns "kal subah" into an ISO 8601 IST timestamp
- `endCall` — records the outcome only, sends nothing

**After the call.** OmniDimension POSTs the transcript to webhook `/post-call`. 

## Files

```
src/index.ts       routes, instant acknowledgement
src/classifier.ts  mid-call tool handlers
src/postcall.ts    post-call delivery
src/whatsapp.ts    Meta Cloud API client
assets/            architecture diagram, resume
```

## What I'd change next

- `/webhook` is unauthenticated. Add a shared-secret header check.
- Callbacks are parsed and logged but not persisted. Write them to Postgres with a scheduler that places the return call.
- The duplicate-delivery guard(for whattsapp messages) is an in-memory Set of call IDs, so it resets on redeploy and would not hold across instances. Move it to Redis.
- A `200` from Meta means accepted, not delivered. Consume the delivery status webhooks to know the difference, and retry transient failures.
- All parameters ride on one integration, so `classifyIntent` generates fields it never reads. Splitting per tool would cut latency on the path.

## Known limitation

OmniDimension injects a spoken phrase before each tool call. Because the model tends to batch its tool calls near the end of a call, the caller can hear the callback confirmed more than once. I tried deleting the parameter (platform-injected, not configurable), prompt guardrails against narrating tool calls, and rewriting the integration description as a silent logging endpoint. None fully suppressed it. Splitting into one integration per tool would space the calls out and resolve it.