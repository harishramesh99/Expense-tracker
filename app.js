
import express from "express";
import dotenv from "dotenv";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from 'url';
import expense from "./routes/expenses.js";
import user from "./routes/users.js";
import auth from "./routes/auth.js";
import connectDB from './config/db.js';
import session from "express-session";
import passport from "passport";
import MongoStore from "connect-mongo";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xssClean from "xss-clean";
import "./config/passport.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

connectDB();

const app = express();

// Security Middleware
app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "http://localhost:5000"], // Allow scripts from localhost
        styleSrc: ["'self'", "https://fonts.googleapis.com"], // Allow styles from self and Google Fonts
        imgSrc: ["'self'", "data:", "https://example.com"], // Allow images from self and example.com
        // Add other directives as needed
      },
    })
  ); // Security headers
app.use(xssClean()); // Prevent XSS
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            collectionName: "sessions",
        }),
        cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 }, // 1 hour
    })
);




app.use(passport.session());
app.use(passport.initialize());




// Rate Limiting (Prevents Brute-Force Attacks)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests
});
app.use(limiter);

// Session Management (Stores in MongoDB)


// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());


app.engine("handlebars", engine({ defaultLayout: false,
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
 }));

app.set("view engine", "handlebars");
app.set("views", "./views");

app.use(express.static(path.join(__dirname, "public")));

app.use(expense);
app.use(user);
app.use(auth);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

