
import express from "express";
import dotenv from "dotenv";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from 'url';
import expense from "./routes/expenses.js";
import user from "./routes/users.js";
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

