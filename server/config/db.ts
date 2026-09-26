import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    await mongoose.connect(mongoURI);

    console.log('[Aurelle] MongoDB connected successfully.');
  } catch (error) {
    console.error('[Aurelle] MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;