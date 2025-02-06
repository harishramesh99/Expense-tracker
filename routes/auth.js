import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import passport from "passport";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { body, validationResult } from "express-validator";

const router = express.Router();


router.get("/register", (req, res) => {
    res.render("register", { title: "Register" });
});

// Signup Route with Validation
router.post(
    "/register", // Make sure this matches the frontend form's action URL
    [
        body("fullname").trim().notEmpty().withMessage("Full name is required"),
        body("email").isEmail().withMessage("Invalid email"),
        body("password")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters long"),
        body("confirmpassword").custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Password confirmation doesn't match password");
            }
            return true;
        }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Return validation errors to the view (Handlebars)
            return res.render("register", {
                errors: errors.array(),
                formData: req.body, // Send back the data for pre-filled form
            });
        }

        const { fullname, email, password } = req.body;

        try {
            let user = await User.findOne({ email });
            if (user) {
                return res.render("register", {
                    message: "User already exists",
                    formData: req.body,
                });
            }

            // Hash Password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create User
            user = new User({
                fullname,
                email,
                password: hashedPassword,
            });

            await user.save();
            res.redirect("/login"); // Redirect to login after successful registration
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error, please try again later" });
        }
    }
);

// Login Route
router.post("/login", passport.authenticate("local", { failureRedirect: "/login" }), (req, res) => {
    res.json({ message: "Login successful" });
});

// Enable 2FA for the User
router.post("/enable-2fa", async (req, res) => {
    const user = await User.findById(req.user.id);

    // Generate 2FA secret
    const secret = speakeasy.generateSecret({ length: 20 });
    user.twoFactorSecret = secret.base32;
    user.twoFactorEnabled = true;
    await user.save();

    // Generate QR Code
    QRCode.toDataURL(secret.otpauth_url, (err, imageUrl) => {
        if (err) return res.status(500).json({ message: "Error generating QR Code" });
        res.json({ message: "2FA enabled", qr: imageUrl });
    });
});

// Verify 2FA Code
router.post("/verify-2fa", async (req, res) => {
    const { token } = req.body;
    const user = await User.findById(req.user.id);

    // Verify the token using speakeasy
    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token,
    });

    if (verified) {
        res.json({ message: "2FA verified" });
    } else {
        res.status(400).json({ message: "Invalid 2FA code" });
    }
});

export default router;
