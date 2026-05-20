import mongoose from 'mongoose'

const userSettingsSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications_enabled: {
      type: Boolean,
      default: true
    },
    sound_enabled: {
      type: Boolean,
      default: true
    },
    break_reminder: {
      type: Boolean,
      default: true
    },
    distraction_warning: {
      type: Boolean,
      default: true
    },
    streak_achievement_notifications: {
      type: Boolean,
      default: true
    },
    weekly_summary_notifications: {
      type: Boolean,
      default: false
    },
    reminder_time: {
      type: String,
      default: '19:30'
    },
    daily_target: {
      type: Number,
      default: 4,
      min: 1,
      max: 24
    },
    weekly_hours_target: {
      type: Number,
      default: 25,
      min: 1,
      max: 168
    },
    language: {
      type: String,
      enum: ['en', 'id'],
      default: 'en'
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
)

export const UserSettings = mongoose.model('UserSettings', userSettingsSchema)
