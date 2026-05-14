import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

type ContactPayload = {
  name: string
  email: string
  subject: string
  message: string
  budget?: string
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: Request) {
  let body: ContactPayload

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, email, subject, message, budget } = body

  // Validate required fields
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: 'Name, email, and message are required.' },
      { status: 422 },
    )
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 422 })
  }

  if (message.trim().length < 20) {
    return NextResponse.json(
      { error: 'Message must be at least 20 characters.' },
      { status: 422 },
    )
  }

  const toEmail = process.env.CONTACT_TO_EMAIL ?? 'hello@paulojuri.com'

  try {
    await resend.emails.send({
      from: 'paulojuri.com <contact@paulojuri.com>',
      to: toEmail,
      replyTo: email,
      subject: `[paulojuri.com] ${subject || 'New message'} — from ${name}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; color: #0A0A0A;">
          <h2 style="margin: 0 0 24px; font-size: 20px; font-weight: 500;">
            New message from paulojuri.com
          </h2>

          <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
            <tr>
              <td style="padding:8px 0; color:#6B6B6B; width:100px; font-size:13px;">Name</td>
              <td style="padding:8px 0; font-size:14px;">${name}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B6B6B; font-size:13px;">Email</td>
              <td style="padding:8px 0; font-size:14px;">
                <a href="mailto:${email}" style="color:#C8773A;">${email}</a>
              </td>
            </tr>
            ${subject ? `
            <tr>
              <td style="padding:8px 0; color:#6B6B6B; font-size:13px;">Subject</td>
              <td style="padding:8px 0; font-size:14px;">${subject}</td>
            </tr>` : ''}
            ${budget ? `
            <tr>
              <td style="padding:8px 0; color:#6B6B6B; font-size:13px;">Budget</td>
              <td style="padding:8px 0; font-size:14px;">${budget}</td>
            </tr>` : ''}
          </table>

          <div style="border-top:1px solid #D4D2CB; padding-top:24px;">
            <p style="color:#6B6B6B; font-size:13px; margin:0 0 8px;">Message</p>
            <p style="font-size:15px; line-height:1.7; white-space:pre-wrap; margin:0;">${message}</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact] Resend error:', err)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 },
    )
  }
}
