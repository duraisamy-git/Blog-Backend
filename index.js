const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require('dotenv').config();
const upload = require("express-fileupload");

const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");


connectDB();

const app = express();
app.use(express.json({extended:true}))
app.use(express.urlencoded({extended: true}))
app.use(cors({credentials:true, origin:"https://blog-frontend-pv92akqnu-duraisamy-gits-projects.vercel.app"}));
app.use(upload());
app.use('/uploads', express.static(__dirname + '/uploads'));


app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

app.use(notFound);
app.use(errorHandler);


app.listen(process.env.PORT || 5000, ()=>{
    console.log("Server is up and Running");
});
