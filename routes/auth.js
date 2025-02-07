import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import passport from "passport";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts, please try again later.",
});

router.get("/register", (req, res) => {
    res.render("register", { title: "Register" });
});



// Signup Route with Validation
router.post(
    "/register", 
    [
        // Full name validation (not empty)
        body("fullname").trim().notEmpty().withMessage("Full name is required"),

        // Email validation (proper email format and check if already registered)
        body("email")
            .isEmail().withMessage("Please provide a valid email address")
            .normalizeEmail()
            .custom(async (email) => {
                const user = await User.findOne({ email });
                if (user) {
                    throw new Error("Email is already registered");
                }
            }),

        // Password validation (minimum length, mix of characters, etc.)
        body("password")
            .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
            .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
            .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
            .matches(/\d/).withMessage("Password must contain at least one number")
            .matches(/[\W_]/).withMessage("Password must contain at least one special character"),

        // Confirm password validation (custom check if passwords match)
        body("confirmpassword")
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error("Password confirmation doesn't match password");
                }
                return true;
            })
    ], 
    async (req, res) => {
        // Handle validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render("register", {
                errors: errors.array(),
                formData: req.body, // Send back the data for pre-filled form
                message: req.session.message || "", // Optional: Pass any messages stored in session
            });
        }
        const { fullname, email, password } = req.body;

        try {
            // Check if user already exists by email
            let user = await User.findOne({ email });
            if (user) {
                return res.render("register", {
                    message: "User already exists with this email",
                    formData: req.body,
                });
            }

            // Hash Password before saving
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new user
            user = new User({
                fullname,
                email,
                password: hashedPassword,
            });

            await user.save(); // Save the user to DB
            req.session.userId = user._id;
            console.log("Session User ID Set:", req.session.userId);
            // Enable 2FA immediately after registration
            const secret = speakeasy.generateSecret({ length: 20 });
            user.twoFactorSecret = secret.base32;
            user.twoFactorEnabled = true; // Set 2FA as enabled
            await user.save(); // Save updated user data

            // Generate QR Code for 2FA
            QRCode.toDataURL(secret.otpauth_url, (err, imageUrl) => {
                if (err) return res.status(500).json({ message: "Error generating QR Code" });

                // Send the QR code to the user for them to scan
                // res.render("register-success", {
                //     message: "User registered successfully. Scan the QR code to enable 2FA.",
                //     qr: imageUrl, // QR Code for the user to scan with Authenticator app
                //     formData: req.body,
                // });

                    // Store the QR image URL in the session
                    req.session.qrCode = imageUrl;

                    // Redirect to the register-success route
                    res.redirect("/register-success");
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error, please try again later" });
        }
    }
);


router.get("/login", (req, res) => {
    res.render("login", { title: "Register" });
});




// auth.js
router.post("/login", authLimiter, (req, res, next) => {
    console.log('Request body:', req.body);
    passport.authenticate("local", (err, user, info) => {
        console.log("User:", user);
        if (err) return next(err);
        if (!user) {
            return res.render("login", { message: info.message });
        }

        // Check if 2FA is enabled for the user
        if (user.twoFactorEnabled) {
            // Save the user ID in session for 2FA verification
            req.session.userId = user._id;
            return res.render("verify-2fa", {
                message: "Enter the code from your Authenticator app."
            });
        }

        // If no 2FA, log the user in and redirect to dashboard
        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.redirect("/dashboard");
        });
    })(req, res, next);
});




router.get("/register-success", (req, res) => {
    if (!req.session.qrCode) {
        return res.redirect("/register"); 
    }
    res.render("register-success", {
        message: "User registered successfully. Scan the QR code to enable 2FA.",
        qr: req.session.qrCode, 
    });

   
    delete req.session.qrCode;
});



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


router.post("/verify-2fa", async (req, res) => {
    const { token } = req.body; // The OTP entered by the 
    console.log("Received Token:", token);
    const userId = req.session.userId; // Retrieve user ID from session
    console.log("User ID:", userId);

    if (!userId) {
        return res.status(400).render("register-success", { message: "User session expired. Please log in again." });
    }

    try {
        // Fetch the user from the database
        const user = await User.findById(userId);
        console.log("User ko sedc:", user);
        if (!user || !user.twoFactorSecret) {
            return res.status(400).render("register-success", { message: "User not found or 2FA not set up." });
        }

        // Verify the OTP using speakeasy
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret, // The stored secret key
            encoding: "base32",
            token, // The OTP entered by the user
            window: 1, // Allows slight time drift
        });

        if (verified) {
            // Mark the user as authenticated for 2FA
            req.session.is2FAAuthenticated = true;

            // Redirect to dashboard or another secured page
            return res.redirect("/dashboard");
        } else {
            return res.render("register-success", { message: "Invalid or expired OTP. Please try again." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).render("register-success", { message: "Server error. Please try again later." });
    }
});





export default router;
