import { connectDB } from '@/lib/mongodb'
import { emailClient } from './emailClient'
import Invitation from '@/models/Invitation'
import { normalizeName, formatName, getInviteURL } from '@/lib/utils'

export interface CreateInvitationInput {
  name: string
  recipientEmail: string
  recipientName?: string
}

export class InvitationService {
  async createInvitation(data: CreateInvitationInput) {
    await connectDB()

    const normalized = normalizeName(data.name)
    const formatted = formatName(data.name)
    const invitationLink = getInviteURL(formatted)

    const invitation = await Invitation.create({
      name: formatted,
      normalizedName: normalized,
      url: invitationLink,
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName || formatted,
      emailSent: false,
      emailSentAt: null,
      emailError: undefined,
    })

    const emailResult = await emailClient.sendInvitation(data.recipientEmail, {
      recipientName: invitation.recipientName,
      invitationLink,
      eventTitle: process.env.NEXT_PUBLIC_EVENT_TITLE,
      eventDate: process.env.NEXT_PUBLIC_EVENT_DATE,
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