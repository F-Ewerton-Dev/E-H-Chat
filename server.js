const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 10000;
const DATA_FILE = path.join(__dirname, "messages.json");

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

function loadMessages() {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveMessages(messages) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2), "utf8");
}

app.post("/save-message", (req, res) => {
    const { user, content, timestamp } = req.body;
    const messages = loadMessages();
    messages.push({ user, content, timestamp });
    saveMessages(messages);
    res.json({ success: true });
});

app.get("/load-messages", (req, res) => {
    res.json(loadMessages());
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
