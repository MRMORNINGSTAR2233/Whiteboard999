import { Resend } from "resend"

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
}

/**
 * Send an email using Resend
 */
export async function sendEmail({ to, subject, html, text, from }: SendEmailOptions) {
  try {
    // If no API key is configured, log and skip
    if (!process.env.RESEND_API_KEY) {
      console.log("[Email] Skipping email send (no API key configured)")
      console.log(`[Email] Would send to: ${to}`)
      console.log(`[Email] Subject: ${subject}`)
      return { success: true, skipped: true }
    }

    const fromAddress = from || process.env.EMAIL_FROM || "Whiteboard <noreply@whiteboard.app>"

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    })

    if (error) {
      console.error("[Email] Failed to send email:", error)
      return { success: false, error }
    }

    console.log("[Email] Email sent successfully:", data?.id)
    return { success: true, data }
  } catch (error) {
    console.error("[Email] Error sending email:", error)
    return { success: false, error }
  }
}

/**
 * Send whiteboard share notification email
 */
export async function sendWhiteboardShareEmail(
  recipientEmail: string,
  recipientName: string,
  whiteboardName: string,
  whiteboardId: string,
  sharedByName: string,
  permission: "VIEW" | "EDIT" | "ADMIN"
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const whiteboardUrl = `${appUrl}/whiteboard/${whiteboardId}`

  const permissionText = {
    VIEW: "view",
    EDIT: "edit",
    ADMIN: "manage",
  }[permission]

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Whiteboard Shared With You</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h1 style="color: #2563eb; margin: 0 0 10px 0; font-size: 24px;">🎨 Whiteboard Shared</h1>
    <p style="margin: 0; color: #6b7280; font-size: 14px;">Collaborative Whiteboard</p>
  </div>

  <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <p style="margin: 0 0 20px 0; font-size: 16px;">Hi ${recipientName || "there"},</p>
    
    <p style="margin: 0 0 20px 0; font-size: 16px;">
      <strong>${sharedByName}</strong> has shared a whiteboard with you:
    </p>

    <div style="background-color: #f8f9fa; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <h2 style="margin: 0 0 5px 0; font-size: 18px; color: #1f2937;">${whiteboardName}</h2>
      <p style="margin: 0; color: #6b7280; font-size: 14px;">
        Permission: <strong style="color: #2563eb;">${permissionText.toUpperCase()}</strong>
      </p>
    </div>

    <p style="margin: 20px 0; font-size: 14px; color: #6b7280;">
      You can now ${permissionText} this whiteboard and collaborate in real-time.
    </p>

    <a href="${whiteboardUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 20px 0;">
      Open Whiteboard
    </a>

    <p style="margin: 20px 0 0 0; font-size: 14px; color: #9ca3af;">
      Or copy and paste this URL into your browser:<br>
      <a href="${whiteboardUrl}" style="color: #2563eb; word-break: break-all;">${whiteboardUrl}</a>
    </p>
  </div>

  <div style="text-align: center; color: #9ca3af; font-size: 12px; padding: 20px 0;">
    <p style="margin: 0 0 5px 0;">This email was sent by Whiteboard</p>
    <p style="margin: 0;">If you didn't expect this email, you can safely ignore it.</p>
  </div>
</body>
</html>
  `

  const text = `
Whiteboard Shared With You

Hi ${recipientName || "there"},

${sharedByName} has shared a whiteboard with you: "${whiteboardName}"

Permission: ${permissionText.toUpperCase()}

You can now ${permissionText} this whiteboard and collaborate in real-time.

Open the whiteboard: ${whiteboardUrl}

---
This email was sent by Whiteboard
If you didn't expect this email, you can safely ignore it.
  `

  return sendEmail({
    to: recipientEmail,
    subject: `${sharedByName} shared "${whiteboardName}" with you`,
    html,
    text,
  })
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationUrl: string
) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h1 style="color: #2563eb; margin: 0 0 10px 0; font-size: 24px;">🎨 Welcome to Whiteboard</h1>
    <p style="margin: 0; color: #6b7280; font-size: 14px;">Verify your email to get started</p>
  </div>

  <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <p style="margin: 0 0 20px 0; font-size: 16px;">Hi ${name || "there"},</p>
    
    <p style="margin: 0 0 20px 0; font-size: 16px;">
      Thanks for signing up! Please verify your email address to start using Whiteboard.
    </p>

    <a href="${verificationUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 20px 0;">
      Verify Email Address
    </a>

    <p style="margin: 20px 0 0 0; font-size: 14px; color: #9ca3af;">
      Or copy and paste this URL into your browser:<br>
      <a href="${verificationUrl}" style="color: #2563eb; word-break: break-all;">${verificationUrl}</a>
    </p>

    <p style="margin: 20px 0 0 0; font-size: 14px; color: #9ca3af;">
      This link will expire in 24 hours.
    </p>
  </div>

  <div style="text-align: center; color: #9ca3af; font-size: 12px; padding: 20px 0;">
    <p style="margin: 0 0 5px 0;">This email was sent by Whiteboard</p>
    <p style="margin: 0;">If you didn't create an account, you can safely ignore this email.</p>
  </div>
</body>
</html>
  `

  const text = `
Welcome to Whiteboard

Hi ${name || "there"},

Thanks for signing up! Please verify your email address to start using Whiteboard.

Verify your email: ${verificationUrl}

This link will expire in 24 hours.

---
This email was sent by Whiteboard
If you didn't create an account, you can safely ignore this email.
  `

  return sendEmail({
    to: email,
    subject: "Verify your email - Whiteboard",
    html,
    text,
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h1 style="color: #2563eb; margin: 0 0 10px 0; font-size: 24px;">🔐 Reset Your Password</h1>
    <p style="margin: 0; color: #6b7280; font-size: 14px;">Whiteboard Account</p>
  </div>

  <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <p style="margin: 0 0 20px 0; font-size: 16px;">Hi ${name || "there"},</p>
    
    <p style="margin: 0 0 20px 0; font-size: 16px;">
      We received a request to reset your password. Click the button below to create a new password:
    </p>

    <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 20px 0;">
      Reset Password
    </a>

    <p style="margin: 20px 0 0 0; font-size: 14px; color: #9ca3af;">
      Or copy and paste this URL into your browser:<br>
      <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
    </p>

    <p style="margin: 20px 0 0 0; font-size: 14px; color: #9ca3af;">
      This link will expire in 1 hour.
    </p>

    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        <strong>Security tip:</strong> If you didn't request this password reset, please ignore this email or contact support if you're concerned.
      </p>
    </div>
  </div>

  <div style="text-align: center; color: #9ca3af; font-size: 12px; padding: 20px 0;">
    <p style="margin: 0 0 5px 0;">This email was sent by Whiteboard</p>
    <p style="margin: 0;">Never share your password with anyone.</p>
  </div>
</body>
</html>
  `

  const text = `
Reset Your Password

Hi ${name || "there"},

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour.

Security tip: If you didn't request this password reset, please ignore this email or contact support if you're concerned.

---
This email was sent by Whiteboard
Never share your password with anyone.
  `

  return sendEmail({
    to: email,
    subject: "Reset your password - Whiteboard",
    html,
    text,
  })
}

/**
 * Send whiteboard comment notification
 */
export async function sendCommentNotificationEmail(
  recipientEmail: string,
  recipientName: string,
  whiteboardName: string,
  whiteboardId: string,
  commenterName: string,
  commentText: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const whiteboardUrl = `${appUrl}/whiteboard/${whiteboardId}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Comment on Whiteboard</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h1 style="color: #2563eb; margin: 0 0 10px 0; font-size: 24px;">💬 New Comment</h1>
    <p style="margin: 0; color: #6b7280; font-size: 14px;">Whiteboard Activity</p>
  </div>

  <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <p style="margin: 0 0 20px 0; font-size: 16px;">Hi ${recipientName || "there"},</p>
    
    <p style="margin: 0 0 20px 0; font-size: 16px;">
      <strong>${commenterName}</strong> commented on <strong>"${whiteboardName}"</strong>:
    </p>

    <div style="background-color: #f8f9fa; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; color: #4b5563;">"${commentText}"</p>
    </div>

    <a href="${whiteboardUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 20px 0;">
      View Comment
    </a>
  </div>

  <div style="text-align: center; color: #9ca3af; font-size: 12px; padding: 20px 0;">
    <p style="margin: 0;">This email was sent by Whiteboard</p>
  </div>
</body>
</html>
  `

  const text = `
New Comment on Whiteboard

Hi ${recipientName || "there"},

${commenterName} commented on "${whiteboardName}":

"${commentText}"

View the comment: ${whiteboardUrl}

---
This email was sent by Whiteboard
  `

  return sendEmail({
    to: recipientEmail,
    subject: `New comment on "${whiteboardName}"`,
    html,
    text,
  })
}
