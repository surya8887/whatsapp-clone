import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(express.json({ limit: "24kb" }));
app.use(express.static("public"));

// test route
app.get("/", (req, res) => {
  res.send("<h1>Surya is here</h1>");
});

// import routes here

import  authRouter  from "./routes/auth.route.js";

app.use("/api/v1/auth/", authRouter);

export { app };
