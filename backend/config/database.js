const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI;

const connectDatabase = () => {
    mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        connectTimeoutMS: 30000,        // Increase connection timeout to 30 seconds
        socketTimeoutMS: 45000,         // Increase socket timeout to 45 seconds
        serverSelectionTimeoutMS: 30000, // Increase server selection timeout to 30 seconds
        maxPoolSize: 10,                // Increase connection pool size
        minPoolSize: 2,                 // Set minimum pool size
        keepAlive: true,                // Keep connections alive
        keepAliveInitialDelay: 300000   // Keep alive delay of 5 minutes
    })
    .then(() => {
        console.log("Mongoose Connected");
    })
    .catch((error) => {
        console.log("MongoDB connection error: " + error);
        console.log("Retrying connection in 5 seconds...");
        // Retry connection after 5 seconds
        setTimeout(connectDatabase, 5000);
    });
    
    // Handle disconnection events and reconnect automatically
    mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected! Attempting to reconnect...');
        setTimeout(connectDatabase, 5000);
    });
    
    mongoose.connection.on('error', (err) => {
        console.log('MongoDB connection error: ' + err);
        mongoose.disconnect();
    });
}

module.exports = connectDatabase;