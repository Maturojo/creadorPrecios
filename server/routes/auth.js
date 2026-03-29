const express = require("express");
const { requireGoogleAuth } = require("../auth/googleAuth");

const router = express.Router();

router.get("/session", requireGoogleAuth, (req, res) => {
  res.json({
    ok: true,
    user: req.authUser,
  });
});

module.exports = router;
