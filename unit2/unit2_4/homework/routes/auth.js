const express = require("express");
const router = express.Router();
const db = require("../utils/db");

router.post("/login", (req, res) => {
    /// !!! CSRF
    // !!! POST /transfer allows requests without verification of the users and if they intended the request
    // !!! CSRF check is below. The following code checks if the CSRF token in the request body 
    // !!! matches the one stored in the session. If they don't match, it returns a 403 Forbidden response, 
    // preventing the login attempt from proceeding.
    if (req.body.csrfToken !== req.session.csrfToken) {
        return res.status(403).send("Invalid CSRF token");
    }

    const { username, password } = req.body;

    db.get(
        // !!! The following code stores passwords in plaintext.
        // "SELECT * FROM users WHERE username=? AND password=?",

        // !!! WEAK PASSWORD HANDLING. I am replacing with following code.
        "SELECT * FROM users WHERE username=?",
        // !!! I removed password from the query.
        [username],
        // !!! Adding the following code to check the password after retrieving the user from the database.
        async (err, user) => {
            if (err) {
                return res.status(500).send("Database error");
            }
            if (!user) {
                return res.status(401).send("Invalid username or password");
            }
            // !!! Adding bcyrpt to compare the provided password with the hashed password stored in the database.
            const match = await bcrypt.compare(password, user.password);

            // !!! if matched, set the session user and userId, and redirect to the dashboard. 
            // !!! If not matched, send a login failed message.
            if (match) {
                /// !!! SESSION FIXATION. I am going to regenerate the session ID upon successful login to prevent session fixation attacks.
                req.session.regenerate((err) => {
                    if (err) {
                        return res.status(500).send("Session regeneration failed");
                    }
                    req.session.user = user.username;
                    req.session.userId = user.id;
                    res.redirect("/dashboard.html");
                });
            } else {
                res.send("Login failed");
            }
        }
    );
});

module.exports = router;
