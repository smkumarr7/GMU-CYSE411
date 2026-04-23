const express = require("express");
const router = express.Router();

router.get("/admin", (req, res) => {
     /// !!! BROKEN ACCESS CONTROL FIX. I am going to add a check to ensure that only authenticated users can access the admin panel.
    // !!! This line checks if the user is logged in by verifying if the session contains a user. If not, it prevents access to the admin panel for unauthenticated users.
     if (!req.session.user) {
        res.status(401).send("Not logged in");
    } 
    
    if (req.session.role !== "admin") {
        return res.status(403).send("Forbidden");
    }
    
    res.send("Admin panel");
    
});

module.exports = router;
