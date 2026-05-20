import mongoose from 'mongoose'
import bcryptjs from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      minlength: 3,
      maxlength: 30
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false // Don't return password by default
    },
    avatar: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      default: '',
      maxlength: 500
    },
    first_name: {
      type: String,
      default: ''
    },
    last_name: {
      type: String,
      default: ''
    },
    university: {
      type: String,
      default: ''
    },
    major: {
      type: String,
      default: ''
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'premium'],
      default: 'free'
    },
    is_active: {
      type: Boolean,
      default: true
    },
    last_login: {
      type: Date,
      default: null
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

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash if password is modified
  if (!this.isModified('password')) return next()

  try {
    const salt = await bcryptjs.genSalt(10)
    this.password = await bcryptjs.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password)
}

// Method to get user without password
userSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  return user
}

export const User = mongoose.model('User', userSchema)
