const express = require("express");
const router = express.Router();

router.post("/upload-url", async (req, res) => {
  const { filename } = req.body;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  console.log("TOKEN?", token);

  if (!filename || !token) {
    return res.status(400).json({ error: "Missing filename or token" });
  }

  try {
    const apiRes = await fetch("https://api.vercel.com/v2/blob/upload-url", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filename }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error("Blob API error:", errText);
      return res.status(502).json({ error: "Blob API error" });
    }

    const { url } = await apiRes.json();
    return res.status(200).json({ url });
  } catch (err) {
    console.error("Upload handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
