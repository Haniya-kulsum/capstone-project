import express from "express";

const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Cloud Run test OK");
});

app.listen(PORT, () => {
  console.log("Listening on", PORT);
});
