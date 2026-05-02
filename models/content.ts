import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IEventContent extends Document {
  title: string
  details?: Array<{
    label: string
    value: string
  }>
  date?: string
  time?: string
  venue?: string
  dressCode?: string
  rsvp: string
  createdAt: Date
  updatedAt: Date
}

const ContentSchema = new Schema<IEventContent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    details: {
      type: [
        {
          label: {
            type: String,
            required: true,
            trim: true,
          },
          value: {
            type: String,
            required: true,
            trim: true,
          },
        },
      ],
      default: [],
    },
    rsvp: {
      type: String,
      required: [true, 'RSVP information is required'],
      trim: true,
      maxlength: [300, 'RSVP cannot exceed 300 characters'],
    },
    date: {
      type: String,
      trim: true,
    },
    time: {
      type: String,
      trim: true,
    },
    venue: {
      type: String,
      trim: true,
    },
    dressCode: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

const Content: Model<IEventContent> =
  mongoose.models.Content || mongoose.model<IEventContent>('Content', ContentSchema)

export default Content
