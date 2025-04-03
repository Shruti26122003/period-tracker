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
    
    // Drop all indexes except _id
    console.log('Dropping all indexes...');
    const indexes = await usersCollection.indexes();
    for (const index of indexes) {
      if (index.name !== '_id_') {
        await usersCollection.dropIndex(index.name);
        console.log(`Dropped index ${index.name}`);
      }
    }
    
    // Create the correct indexes
    console.log('Creating new indexes...');
    await usersCollection.createIndex({ email: 1 }, { unique: true, background: true });
    console.log('Created email index');
    await usersCollection.createIndex({ username: 1 }, { unique: true, sparse: true, background: true });
    console.log('Created username index with sparse option');
    
    // Verify the indexes
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