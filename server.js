const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "messages.json");

// Garantir que o arquivo JSON existe
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

function loadMessages() {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveMessages(messages) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2), "utf8");
}

// Rota para salvar mensagens
app.post("/save-message", (req, res) => {
    const { user, content, timestamp, isImage = false } = req.body;
    const messages = loadMessages();
    messages.push({ user, content, timestamp, isImage, reactions: [] });
    saveMessages(messages);
    res.json({ success: true });
});

// Rota para salvar reações
app.post("/react", (req, res) => {
    const { index, reaction } = req.body;
    let messages = loadMessages();
    if (messages[index]) {
        messages[index].reactions.push(reaction);
        saveMessages(messages);
    }
    res.json({ success: true });
});

// Rota para carregar mensagens
app.get("/load-messages", (req, res) => {
    res.json(loadMessages());
});

// Inicia o servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
