import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import routes from "./Routes/index.js";
const app = express();
app.use(
  cors({
    origin: "*",
    credentials: true,
    methodes: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);
export default app;
