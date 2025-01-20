import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            'mongodb+srv://suketu20:Suketu%405748@cluster0.baqwytc.mongodb.net/manager'
        );
        console.log(`\nMongoDB connected || DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log('MONGODB Connection error ', error);
        process.exit(1); // Exit the process with a failure code
    }
};

export default connectDB;
