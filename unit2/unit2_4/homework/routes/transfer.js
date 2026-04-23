const express = require("express");
const router = express.Router();
const db = require("../utils/db");

router.post("/transfer", (req, res) => {
    /// !!! PARAMETER TAMPERING FIX. I am going to add a check to ensure that the user is authorized 
    // to transfer funds from the specified account.
    const from = req.session.userAccountId;
    const to = req.body.toAccount;
    const amount = parseInt(req.body.amount);

    /// !!! BUSINESS LOGIC FIX. I am going to add a check to ensure that the transfer amount is positive and that the user has sufficient funds in their account before allowing the transfer to proceed.
    if (amount <= 0) {
        return res.status(400).send("Invalid transfer amount");
    }

    db.run("UPDATE accounts SET balance = balance - ? WHERE id=?", [amount, from]);
    db.run("UPDATE accounts SET balance = balance + ? WHERE id=?", [amount, to]);

    res.send("Transfer complete");
});

module.exports = router;
