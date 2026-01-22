// server.js
import dotenv from "dotenv";

//setting up config file
dotenv.config({path:'config.env'})

import express from "express";
import mongoose from "mongoose";

import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from './routes/user.js';
import urlRoutes from './routes/url.js';



const app = express();
app.use(express.json());
app.use(cookieParser());


app.use(cors({
  origin: "https://sandyurl.pages.dev",
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  credentials: true,
}));






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
