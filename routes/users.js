import express from 'express';


const user = express.Router();


// //Register route
// user.get("/register", (req, res) => 
//     res.render("register", { title: "Register" }));
// user.post("/register", (req, res) => {
//     console.log(req.body);
//     res.send("Registration successful!");
// });

// //login route
// user.get("/login", (req, res) => 
//     res.render("login", { title: "Login" }));
// user.post("/login", (req, res) => {
//     console.log(req.body);
//     res.send("Login successful!");
// });

export default user;