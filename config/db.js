const mongoose = require("mongoose");


const url = "mongodb+srv://duraisamy22122000:duraidurai@cluster0.s2e7bw0.mongodb.net/bloggers?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async()=>{
    const con =await mongoose.connect(url);
    console.log(`Mongodb is connected:${con.connection.host}`);
};

module.exports = connectDB;