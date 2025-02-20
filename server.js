const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 10000;
const DATA_FILE = path.join(__dirname, "messages.json");
const UPLOAD_DIR = path.join(__dirname, "uploads");

if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.use("/uploads", express.static(UPLOAD_DIR));

app.post("/save-message", (req, res) => {
    const messages = JSON.parse(fs.readFileSync(DATA_FILE));
    messages.push(req.body);
    fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));
    res.json({ success: true });
});

app.post("/save-media", upload.single("media"), (req, res) => {
    const messages = JSON.parse(fs.readFileSync(DATA_FILE));
    messages.push({ user: req.body.user, content: req.file.filename, timestamp: new Date().toLocaleTimeString(), isImage: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));
    res.json({ success: true });
});

app.get("/load-messages", (req, res) => res.json(JSON.parse(fs.readFileSync(DATA_FILE))));

// ** Novo endpoint para deletar mensagens **
app.delete("/delete-message/:index", (req, res) => {
    let messages = JSON.parse(fs.readFileSync(DATA_FILE));
    const index = parseInt(req.params.index, 10);

    if (index >= 0 && index < messages.length) {
        const deletedMessage = messages[index];

        // Se for uma imagem, deleta do servidor também
        if (deletedMessage.isImage && deletedMessage.content) {
            const filePath = path.join(UPLOAD_DIR, deletedMessage.content);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        messages.splice(index, 1);
        fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));
        res.json({ success: true });
    } else {
        res.status(400).json({ error: "Índice inválido" });
    }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
