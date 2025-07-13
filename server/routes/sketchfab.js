const express = require("express");
const router = express.Router();

let fetchFunc;

// Use native fetch if available (Node 18+), else fallback to node-fetch
try {
  fetchFunc = fetch;
} catch {
  fetchFunc = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
}

router.get("/sketchfab", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "No query provided" });

  try {
    const url = `https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(q)}&downloadable=true`;
    console.log("Fetching (API):", url);

    const response = await fetchFunc(url);
    const json = await response.json();
    console.log("Sketchfab API results:", json.results?.length);

    const firstModel = json.results?.[0];
    if (firstModel?.uid) {
      return res.json({ modelId: firstModel.uid });
    } else {
      return res.status(404).json({ error: "No model found" });
    }
  } catch (err) {
    console.error("🔥 Server error:", err);
    return res.status(500).json({ error: "Fetch failed" });
  }
});

module.exports = router;
