import mongoose from 'mongoose'

export async function connectDB() {
  try {
    const uri = process.env.MONGO_URI
    if (!uri) {
      throw new Error('MONGO_URI not found in environment variables')
    }

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`)
    process.exit(1)
  }
}

export default connectDB
