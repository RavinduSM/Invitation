import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
    userName: string
    userEmail: string
    userPwd: string
    userRole: 'admin' | 'editor' | 'viewer'
    createdAt: Date
    updatedAt: Date
    comparePassword(plainTextPassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
    {
        userName: {
            type: String,
            required: [true, 'Event title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        userEmail: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        userPwd: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters long'],
        },
        userRole: {
            type: String,
            enum: ['admin', 'editor', 'viewer'],
            default: 'viewer',
        },
    },
    {
        timestamps: true,
    }
)

// Pre-save middleware to hash password
UserSchema.pre('save', async function (this: IUser) {
    // Only hash if password is new or modified
    if (!this.isModified('userPwd')) {
        return
    }

    const salt = await bcrypt.genSalt(10)
    this.userPwd = await bcrypt.hash(this.userPwd, salt)
})

// Method to compare passwords
UserSchema.methods.comparePassword = async function (
    plainTextPassword: string
): Promise<boolean> {
    return await bcrypt.compare(plainTextPassword, this.userPwd)
}

// Ensure unique index on userEmail and username
UserSchema.index({ userEmail: 1, userName: 1 }, { unique: true })

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User
