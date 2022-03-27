const mongoose = require('mongoose');

const MONGODB = process.env.MONGODB

async function connectToMongo() {
    await mongoose.connect(MONGODB, { useNewUrlParser: true }, () => {
        console.log("Connected to mongo successfully");
    });
}

module.exports = connectToMongo;