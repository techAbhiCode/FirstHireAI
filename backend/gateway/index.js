import express from 'express'
import dotenv from "dotenv"
dotenv.config()
import proxy from 'express-http-proxy'
import dns from "dns"
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { isAuth } from './middlewares/isAuth.js'
import { getCurrentUser } from './controllers/user.controller.js'
import { proxyWithUser } from './utils/proxyWithHeaders.js'
dns.setServers([
      '1.1.1.1',
      '8.8.8.8'
])
const app = express()
app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000
app.use(express.json())

const allowedOrigins = [
  "http://localhost",
  "http://localhost:80",
  "http://localhost:5173",
  "http://127.0.0.1",
  "http://127.0.0.1:80",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(morgan("dev"));
app.use(cookieParser());

app.get("/", (req,res)=>{
    return res.send(`hello from Server`)


})
app.use("/api/auth",proxy(process.env.AUTH_SERVICE_URL))

app.get("/api/me",isAuth,getCurrentUser)

app.use("/api/interview",isAuth,proxyWithUser(process.env.INTERVIEW_SERVICE_URL))

app.use("/api/resume",isAuth,proxyWithUser(process.env.RESUME_SERVICE_URL))

app.use("/api/roadmap",isAuth,proxyWithUser(process.env.ROADMAP_SERVICE_URL))

app.use("/api/billing",isAuth,proxyWithUser(process.env.BILLING_SERVICE_URL))

app.listen(PORT,()=>{
    console.log(`Gateway Started on ${PORT}`)
   
})

