const express = require("express");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

const router = express.Router();
const TEMP_DIR = path.join(__dirname, "..", "..", "frontend", "public", "models", "biology");

// Ensure target directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

router.get("/sketchfab-glb", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "No query provided" });

  try {
    const searchRes = await fetch(`https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(q)}&downloadable=true`);
    const searchData = await searchRes.json();

    const first = searchData.results?.[0];
    if (!first) return res.status(404).json({ error: "No downloadable model found" });

    const downloadRes = await fetch(`https://api.sketchfab.com/v3/models/${first.uid}/download`);
    const downloadData = await downloadRes.json();
    const zipUrl = downloadData?.gltf?.url;
    if (!zipUrl) return res.status(404).json({ error: "GLB zip not available" });

    const zipRes = await fetch(zipUrl);
    const buffer = await zipRes.arrayBuffer();

    const zip = new AdmZip(Buffer.from(buffer));
    const zipEntries = zip.getEntries();

    const glbFile = zipEntries.find(e => e.entryName.endsWith(".glb"));
    if (!glbFile) return res.status(404).json({ error: "No .glb file found in zip" });

    const fileName = `${q.toLowerCase().replace(/\s+/g, "_")}.glb`;
    const outputPath = path.join(TEMP_DIR, fileName);

    fs.writeFileSync(outputPath, zip.readFile(glbFile));
    return res.json({ glbUrl: `/models/biology/${fileName}` });
  } catch (err) {
    console.error("❌ Sketchfab GLB fetch failed:", err);
    return res.status(500).json({ error: "Failed to retrieve model" });
  }
});

module.exports = router;
