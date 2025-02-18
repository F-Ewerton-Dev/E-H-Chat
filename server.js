const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
app.use(express.json());
app.use(cors()); // Permitir requisições de qualquer origem
app.use(express.static("public"));

const PORT = process.env.PORT || 10000;
const DATA_FILE = path.join(__dirname, "messages.json");
const UPLOAD_DIR = "/tmp/uploads"; // Usar /tmp para compatibilidade com Render

// Criar arquivos e diretórios necessários
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Rota para salvar mensagens de texto
app.post("/save-message", (req, res) => {
    if (!req.body.user || !req.body.content) {
        return res.status(400).json({ success: false, message: "Dados inválidos" });
    }
    
    const messages = JSON.parse(fs.readFileSync(DATA_FILE));
    messages.push({ user: req.body.user, content: req.body.content });
    fs.writeFileSync(DATA_FILE, JSON.stringify(messages));

    res.json({ success: true });
});

// Rota para salvar imagens
app.post("/save-image", upload.single("image"), (req, res) => {
    if (!req.body.user || !req.file) {
        return res.status(400).json({ success: false, message: "Dados inválidos" });
    }

    const messages = JSON.parse(fs.readFileSync(DATA_FILE));
    messages.push({ user: req.body.user, image: `/uploads/${req.file.filename}` });
    fs.writeFileSync(DATA_FILE, JSON.stringify(messages));

    res.json({ success: true });
});

// Rota para carregar mensagens
app.get("/load-messages", (req, res) => {
    res.json(JSON.parse(fs.readFileSync(DATA_FILE)));
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
