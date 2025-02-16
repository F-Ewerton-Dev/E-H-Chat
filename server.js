const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public")); // Certifica que os arquivos estáticos estão acessíveis

const PORT = process.env.PORT || 10000; // Ajuste para Render
const DATA_FILE = path.join(__dirname, "messages.json");
const UPLOAD_DIR = path.join(__dirname, "public/uploads");

// Garantir que o arquivo messages.json existe
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");

// Criar diretório uploads se não existir
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Rota para salvar mensagens de texto
app.post("/save-message", (req, res) => {
    const messages = JSON.parse(fs.readFileSync(DATA_FILE));
    messages.push({ user: req.body.user, content: req.body.content });
    fs.writeFileSync(DATA_FILE, JSON.stringify(messages));
    res.json({ success: true });
});

// Rota para upload de imagem
app.post("/save-image", upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Nenhuma imagem enviada" });

    const messages = JSON.parse(fs.readFileSync(DATA_FILE));
    const imageUrl = `/uploads/${req.file.filename}`; // Caminho correto da imagem
    messages.push({ user: req.body.user, image: imageUrl });
    fs.writeFileSync(DATA_FILE, JSON.stringify(messages));
    res.json({ success: true, imageUrl });
});

// Rota para carregar mensagens
app.get("/load-messages", (req, res) => {
    res.json(JSON.parse(fs.readFileSync(DATA_FILE)));
});

// Inicia o servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
