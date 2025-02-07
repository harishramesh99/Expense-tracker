// import passport from "passport";
// import { Strategy as LocalStrategy } from "passport-local";
// import bcrypt from "bcryptjs";
// import User from "../models/User.js"; // Make sure the User model is correctly imported

// // Local Strategy for Authentication
// passport.use(
//     new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
//         try {
//             const user = await User.findOne({ email });
//             console.log(user);
//             if (!user) {
//                 return done(null, false, { message: "User not found" });
//             }

//             // Compare hashed password
//             const isMatch = await bcrypt.compare(password, user.password);
//             if (!isMatch) {
//                 return done(null, false, { message: "Incorrect password" });
//             }

//             return done(null, user);
//         } catch (error) {
//             return done(error);
//         }
//     })
// );

// // Serialize User
// passport.serializeUser((user, done) => {
//     done(null, user.id);
// });

// // Deserialize User
// passport.deserializeUser(async (id, done) => {
//     try {
//         const user = await User.findById(id);
//         done(null, user);
//     } catch (error) {
//         done(error);
//     }
// });

// export default passport;
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import User from "../models/User.js"; // Ensure the User model is correctly imported

// Local Strategy for Authentication
passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            console.log(user,"va");
            if (!user) {
                return done(null, false, { message: "User not found la" });
            }

            // Compare hashed password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: "Incorrect password" });
            }

            // Check if user has 2FA enabled
            if (user.twoFactorEnabled) {
                return done(null, user, { message: "2FA required" });
            }

            // If no 2FA, authenticate the user and return the user object
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    })
);

// Serialize User
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize User
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        console.log(user,"user");
        // You may need to manually track the 2FA status in the session if you want to persist it
        if (user) {
            // Check the session or database for the 2FA status
            // Assuming that you save is2FAAuthenticated in the session during 2FA verification
            done(null, user);  // Pass the user to the session
        } else {
            done(new Error("User not found"), null);
        }
    } catch (error) {
        done(error, null);
    }
});

export default passport;
