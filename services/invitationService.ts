import { connectDB } from '@/lib/mongodb'
import { emailClient } from './emailClient'
import Invitation from '@/models/Invitation'
import Content from '@/models/content'
import { normalizeName, formatName, getInviteURL } from '@/lib/utils'

export interface CreateInvitationInput {
  name: string
  recipientEmail: string
  recipientName?: string
  contentId?: string
}

export class InvitationService {
  async createInvitation(data: CreateInvitationInput) {
    await connectDB()

    const normalized = normalizeName(data.name)
    const formatted = formatName(data.name)
    const invitationLink = getInviteURL(formatted)

    const content = data.contentId ? await Content.findById(data.contentId).lean() : null
    const eventTitle = content?.title || process.env.NEXT_PUBLIC_EVENT_TITLE
    const eventDate = content?.date || process.env.NEXT_PUBLIC_EVENT_DATE

    const invitation = await Invitation.create({
      name: formatted,
      normalizedName: normalized,
      url: invitationLink,
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName || formatted,
      contentId: data.contentId,
      emailSent: false,
      emailSentAt: null,
      emailError: undefined,
    })

    const emailResult = await emailClient.sendInvitation(data.recipientEmail, {
      recipientName: invitation.recipientName,
      invitationLink,
      eventTitle: content?.title || process.env.NEXT_PUBLIC_EVENT_TITLE,
      eventDate: content?.date || process.env.NEXT_PUBLIC_EVENT_DATE,
    })

    await Invitation.findByIdAndUpdate(invitation._id, {
      emailSent: emailResult.success,
      emailSentAt: emailResult.success ? new Date() : null,
      emailError: emailResult.success ? null : emailResult.error,
    })

    return invitation
  }

  async getInvitation(id: string) {
    await connectDB()
    return Invitation.findById(id)
  }

  async listInvitations() {
    await connectDB()
    return Invitation.find({}).sort({ createdAt: -1 }).lean()
  }
}

export const invitationService = new InvitationService();