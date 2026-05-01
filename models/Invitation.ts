import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IInvitation extends Document {
  name: string
  normalizedName: string
  url: string
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
  },
  {
    timestamps: true,
  }
)

// Ensure unique index on normalizedName
InvitationSchema.index({ normalizedName: 1 }, { unique: true })

const Invitation: Model<IInvitation> =
  mongoose.models.Invitation || mongoose.model<IInvitation>('Invitation', InvitationSchema)

export default Invitation
