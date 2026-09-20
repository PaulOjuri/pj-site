import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

interface EnquiryBody {
  name: string
  email: string
  phone?: string
  eventType: string
  date?: string
  guestCount?: string
  source?: string
  vision: string
  website?: string
}

function isEnquiryBody(value: unknown): value is EnquiryBody {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.name === 'string' &&
    typeof v.email === 'string' &&
    typeof v.eventType === 'string' &&
    typeof v.vision === 'string'
  )
}

function validateEnquiry(body: EnquiryBody): string | null {
  if (!body.name || body.name.trim().length < 1) return 'Name is required'
  if (body.name.length > 100) return 'Name is too long'
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return 'Valid email is required'
  if (!body.eventType || body.eventType.trim().length < 1) return 'Event type is required'
  if (!body.vision || body.vision.trim().length < 10) return 'Please tell us a little more about your vision'
  if (body.vision.length > 5000) return 'Vision description is too long'
  return null
}

export async function POST(req: NextRequest) {
  try {
    const rawBody: unknown = await req.json()

    if (!isEnquiryBody(rawBody)) {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    const body = rawBody

    // Honeypot check
    if (body.website && body.website.length > 0) {
      return NextResponse.json({ ok: true })
    }

    const validationError = validateEnquiry(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('RESEND_API_KEY is not configured')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const resend = new Resend(apiKey)

    await resend.emails.send({
      from: 'Luxciti Enquiries <enquiries@paulojuri.com>',
      to: 'gift@luxciti.co.uk',
      replyTo: body.email,
      subject: `New Luxciti Enquiry — ${body.eventType} — ${body.name}`,
      text: `
New Enquiry from Luxciti Website
═══════════════════════════════════

Name:         ${body.name}
Email:        ${body.email}
Phone:        ${body.phone ?? 'Not provided'}

Event Type:   ${body.eventType}
Date:         ${body.date ?? 'Not specified'}
Guest Count:  ${body.guestCount ?? 'Not specified'}
Found via:    ${body.source ?? 'Not specified'}

Their vision:
─────────────
${body.vision}

═══════════════════════════════════
Sent from luxciti.paulojuri.com
      `.trim(),
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Enquiry email error:', e)
    return NextResponse.json({ error: 'Failed to send enquiry. Please try again or email gift@luxciti.co.uk directly.' }, { status: 500 })
  }
}
