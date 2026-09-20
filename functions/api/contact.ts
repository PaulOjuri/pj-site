interface Env {
  RESEND_API_KEY: string
  CONTACT_TO_EMAIL: string
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': 'https://paulojuri.com',
    },
  })
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: { name?: string; email?: string; subject?: string; message?: string; budget?: string }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const { name, email, subject, message, budget } = body

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return json({ error: 'Name, email, and message are required.' }, 422)
  }
  if (!isValidEmail(email)) {
    return json({ error: 'Invalid email address.' }, 422)
  }
  if (message.trim().length < 20) {
    return json({ error: 'Message must be at least 20 characters.' }, 422)
  }

  const toEmail = env.CONTACT_TO_EMAIL ?? 'hello@paulojuri.com'

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: 'paulojuri.com <contact@paulojuri.com>',
      to: toEmail,
      reply_to: email,
      subject: `[paulojuri.com] ${subject || 'New message'} - from ${name}`,
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
            ${subject ? `<tr><td style="padding:8px 0; color:#6B6B6B; font-size:13px;">Subject</td><td style="padding:8px 0; font-size:14px;">${subject}</td></tr>` : ''}
            ${budget ? `<tr><td style="padding:8px 0; color:#6B6B6B; font-size:13px;">Budget</td><td style="padding:8px 0; font-size:14px;">${budget}</td></tr>` : ''}
          </table>
          <div style="border-top:1px solid #D4D2CB; padding-top:24px;">
            <p style="color:#6B6B6B; font-size:13px; margin:0 0 8px;">Message</p>
            <p style="font-size:15px; line-height:1.7; white-space:pre-wrap; margin:0;">${message}</p>
          </div>
        </div>
      `,
    }),
  })

  if (!res.ok) {
    return json({ error: 'Failed to send message. Please try again.' }, 500)
  }

  return json({ success: true })
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'access-control-allow-origin': 'https://paulojuri.com',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
  })
}
