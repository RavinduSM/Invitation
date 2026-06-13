// Communication layer with email microservice

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

interface EmailResponse {
  success: boolean
  messageId?: string
  error?: string
}

interface InvitationEmailData {
  recipientName?: string
  invitationLink: string
  eventTitle?: string
  eventDate?: string
}

class EmailClient {
  private baseUrl: string
  private apiKey: string
  private from: string

  constructor() {
    this.baseUrl =
      process.env.EMAIL_SERVICE_URL || 'http://localhost:3001'
    this.apiKey = process.env.EMAIL_SERVICE_API_KEY || ''
    this.from = process.env.EMAIL_FROM || 'no-reply@invitation.app'
  }

  async sendEmail(payload: EmailPayload): Promise<EmailResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        const serviceMessage =
          errorBody?.error || errorBody?.message || response.statusText
        throw new Error(`Email service error: ${serviceMessage}`)
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to send email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendInvitation(
    email: string,
    invitationData: InvitationEmailData
  ): Promise<EmailResponse> {
    const html = this.generateInvitationHTML(invitationData)

    return this.sendEmail({
      to: email,
      from: this.from,
      subject: `You're invited!`,
      html,
    })
  }

  private generateInvitationHTML(data: InvitationEmailData): string {
    const title = data.eventTitle || 'A special event'
    const dateLine = data.eventDate ? `<p><strong>Date:</strong> ${data.eventDate}</p>` : ''

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .button { display: inline-block; padding: 12px 24px; background: #4F46E5;
                      color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>You're Invited!</h1>
            </div>
            <div class="content">
              ${data.recipientName ? `<p>Hi ${data.recipientName},</p>` : '<p>Hi there,</p>'}
              <p>You've been invited to <strong>${title}</strong>.</p>
              ${dateLine}
              <p>Click below to view your personalized invitation:</p>
              <a href="${data.invitationLink}" class="button">View Invitation</a>
              <p>If you have any questions, reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}

export const emailClient = new EmailClient();