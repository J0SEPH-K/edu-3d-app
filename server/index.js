const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 5050;

app.use(cors());
app.use(express.static(path.join(__dirname, "..", "frontend", "public")));


app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
