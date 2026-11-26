import express from "express";
import cors from "cors";
import path from "path";
import { initDB } from "./db";
import { getPortfolioData } from "./routes/data";
import { sendContactMessage } from "./routes/contact";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, "../../frontend")));

// GET /api/data - Donnees du portfolio
app.get("/api/data", getPortfolioData);

// POST /api/contact - Envoi de message
app.post("/api/contact", sendContactMessage);

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Serveur demarre sur http://localhost:${PORT}`);
  });
});
