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
    console.warn(`⚠️  MongoDB Connection Warning: ${error.message}`)
    console.warn('ℹ️  Server will start without database - ensure MongoDB is running for full functionality')
    console.warn('📝 To set up MongoDB:')
    console.warn('   1. Download MongoDB Community Edition from mongodb.com')
    console.warn('   2. Run: mongod')
    console.warn('   OR use MongoDB Atlas cloud: https://www.mongodb.com/cloud/atlas')
    return null
  }
}

export default connectDB

