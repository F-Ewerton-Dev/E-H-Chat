// Atualização no server.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(cors());

const DATA_FILE = "messages.json";

function loadMessages() {
    if (fs.existsSync(DATA_FILE)) {
        return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    }
    return [];
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
    res.send({ success: true });
});

// Rota para salvar reações
app.post("/react", (req, res) => {
    const { index, reaction } = req.body;
    let messages = loadMessages();
    if (messages[index]) {
        messages[index].reactions.push(reaction);
        saveMessages(messages);
    }
    res.send({ success: true });
});

// Rota para carregar mensagens
app.get("/load-messages", (req, res) => {
    res.json(loadMessages());
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
