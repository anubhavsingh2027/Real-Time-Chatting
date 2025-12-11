import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";


//====Extra Router add for my Portfolio =====
import portfolio from "./routes/portfolioIp.route.js"

const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;

app.use(express.json({ limit: "50mb" })); // req.body
app.use(
  cors({
    origin: [
      ENV.CLIENT_URL,
      "https://anubhav.nav-code.com",
    ],
    credentials: true,
  })
);

app.use(cookieParser());

//==Server Starting

app.get('/',(req,res,next)=>{
  res.send("Server Running");
})

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);


//===Extra ====
app.use("/detector",portfolio);


server.listen(PORT, () => {
  console.log("Server running on port: " + PORT);
  connectDB();
});
