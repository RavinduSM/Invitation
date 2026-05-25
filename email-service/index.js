const express = require('express')
const nodemailer = require('nodemailer')
const dotenv = require('dotenv')

dotenv.config()

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 3001
const API_KEY = process.env.EMAIL_SERVICE_API_KEY || ''
const DEFAULT_FROM = process.env.EMAIL_FROM || 'no-reply@invitation.app'

const requiredEnv = [
  { name: 'SMTP_HOST', value: process.env.SMTP_HOST },
  { name: 'SMTP_PORT', value: process.env.SMTP_PORT },
  { name: 'SMTP_USER', value: process.env.SMTP_USER },
  { name: 'SMTP_PASS', value: process.env.SMTP_PASS },
]

const missingEnv = requiredEnv.filter((env) => !env.value)
let transporter = null
let smtpReady = false

if (missingEnv.length > 0) {
  console.warn(
    'SMTP is not fully configured for email-service. Email sending will be disabled until the following variables are provided:',
    missingEnv.map((env) => env.name).join(', ')
  )
} else {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  transporter.verify().then(() => {
    smtpReady = true
    console.log('SMTP transporter verified successfully')
  }).catch((error) => {
    console.error('Failed to verify SMTP transporter:', error)
  })
}

app.get('/', (_req, res) => {
  res.json({ success: true, message: 'Email microservice is running' })
})

app.post('/api/email/send', async (req, res) => {
  const apiKey = req.headers['x-api-key'] || ''
  if (API_KEY && apiKey !== API_KEY) {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }

  const { to, subject, html, from } = req.body
  if (!to || !subject || !html) {
    return res.status(400).json({ success: false, error: 'Missing required payload fields' })
  }

  if (!smtpReady || !transporter) {
    return res.status(500).json({
      success: false,
      error:
        'Email service is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in email-service/.env and restart the service.',
    })
  }

  try {
    const info = await transporter.sendMail({
      from: from || DEFAULT_FROM,
      to,
      subject,
      html,
    })

    return res.json({ success: true, messageId: info.messageId })
  } catch (error) {
    console.error('Email send error:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    })
  }
})

app.listen(PORT, () => {
  console.log(`Email microservice listening on port ${PORT}`)
})
