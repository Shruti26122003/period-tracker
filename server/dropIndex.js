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
    
    // List all indexes to verify
    console.log('Current indexes:');
    const indexes = await usersCollection.indexes();
    console.log(indexes);
    
    // Drop the username_1 index if it exists
    const indexExists = indexes.some(index => index.name === 'username_1');
    if (indexExists) {
      await usersCollection.dropIndex('username_1');
      console.log('Successfully dropped username_1 index');
    } else {
      console.log('The username_1 index does not exist');
    }
    
    // Verify the indexes again
    const updatedIndexes = await usersCollection.indexes();
    console.log('Updated indexes:');
    console.log(updatedIndexes);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

main(); // Execute the function 