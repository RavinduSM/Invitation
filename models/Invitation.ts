import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IInvitation extends Document {
  name: string
  normalizedName: string
  url: string
  recipientEmail?: string
  recipientName?: string
  contentId?: mongoose.Types.ObjectId
  emailSent?: boolean
  emailSentAt?: Date | null
  emailError?: string
  createdAt: Date
  updatedAt: Date
}

const InvitationSchema = new Schema<IInvitation>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    normalizedName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
    },
    recipientEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    recipientName: {
      type: String,
      trim: true,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
      default: null,
    },
    emailError: {
      type: String,
      default: null,
    },
    contentId: {
      type: Schema.Types.ObjectId,
      ref: 'Content',
      required: false,
    },
  },
  {
    timestamps: true,
  }
)

const Invitation: Model<IInvitation> =
  mongoose.models.Invitation || mongoose.model<IInvitation>('Invitation', InvitationSchema)

export default Invitation
