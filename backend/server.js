import express from "express";
import http from "http";
import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();
// Load environment variables from .env file

const server = http.createServer(app);
const port = process.env.PORT;
console.log(port);
server.listen(port, () => {
  console.log(`App running on port : ${port}`);
});
app.use(express.json());
