// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from './routes/user.js';
import urlRoutes from './routes/url.js';

const app = express();
app.use(express.json());
app.use(cookieParser());


app.use(cors({
    origin: true, // allows all origins dynamically
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));


//setting up config file
dotenv.config({path:'config.env'})


// User routes
app.use('/api/v2', userRoutes);
app.use('/api/v2', urlRoutes);

app.get("/", (req, res) => {
  res.send("URL Shortener Service is running");
});

mongoose
  .connect(process.env.DB_LOCAL_URI)
  .then(() => {
    app.listen(4000, () => console.log("MongoDb Database connected with host.\nServer is running on port 4000"));
  });
