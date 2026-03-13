const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Connect using modern defaults (deprecated options removed)
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error(`MongoDB connection error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        console.error('\n⚠️  MongoDB Atlas Connection Failed!');
        console.error('Please check:');
        console.error('1. Your IP address is whitelisted in MongoDB Atlas');
        console.error('   - Go to: https://cloud.mongodb.com/');
        console.error('   - Network Access → Add IP Address → Add Current IP Address');
        console.error('2. Your MongoDB credentials are correct in .env file');
        console.error('3. Your cluster is running (not paused)');
        console.error('\n');
        // Don't exit - allow server to run without DB for now
        // process.exit(1);
    }
};

module.exports = connectDB;
