const requireAuth = (req, res, next) => {
    if (!req.session.userId) { // If user is not logged in
        return res.redirect("/login"); // Redirect to login page
    }
    next(); // Proceed if authenticated
};

export default requireAuth;