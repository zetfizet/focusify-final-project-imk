import mongoose from 'mongoose'

const sessionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Session name is required'],
      maxlength: 200
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 1,
      max: 480 // max 8 hours
    },
    totalDuration: {
      type: Number,
      required: [true, 'Total duration is required']
    },
    type: {
      type: String,
      enum: ['Pomodoro', 'Custom'],
      required: [true, 'Session type is required']
    },
    ambience: {
      type: String,
      required: [true, 'Ambience is required']
    },
    focusMode: {
      type: Boolean,
      default: true
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required']
    },
    timeLabel: {
      type: String,
      required: [true, 'Time label is required']
    },
    distractions: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['done', 'partial'],
      default: 'done'
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: 0,
      max: 100
    },
    tags: {
      type: [String],
      default: []
    },
    notes: {
      type: String,
      default: '',
      maxlength: 1000
    },
    created_at: {
      type: Date,
      default: Date.now,
      index: true
    },
    updated_at: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
)

// Index for faster queries
sessionSchema.index({ user_id: 1, created_at: -1 })

export const Session = mongoose.model('Session', sessionSchema)
