const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/period-tracker');
    console.log('MongoDB connected');
    
    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Count documents
    const count = await usersCollection.countDocuments();
    console.log(`Found ${count} users in the collection`);
    
    // Show a few users to understand the data structure
    if (count > 0) {
      const users = await usersCollection.find({}).limit(5).toArray();
      console.log('Sample users:');
      console.log(JSON.stringify(users, null, 2));
    }
    
    // Check if users with null username exist
    const nullUsernameCount = await usersCollection.countDocuments({ username: null });
    console.log(`Found ${nullUsernameCount} users with null username`);
    
    if (nullUsernameCount > 0) {
      // Option 1: Delete all users with null username
      // await usersCollection.deleteMany({ username: null });
      // console.log(`Deleted ${nullUsernameCount} users with null username`);
      
      // Option 2: Update all users with null username to have a random username
      const updateResult = await usersCollection.updateMany(
        { username: null }, 
        { $set: { username: 'user_' + Math.random().toString(36).substring(2, 10) } }
      );
      console.log(`Updated ${updateResult.modifiedCount} users with null username`);
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

main(); // Execute the function 