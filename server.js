const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Criação da pasta uploads se não existir
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const app = express();

// Habilitar CORS para requisições de outros domínios
app.use(cors());

// Configuração do multer para armazenamento de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Salvar as imagens na pasta 'uploads'
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nome com timestamp
  },
});

// Criando o middleware do multer com o storage configurado
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB por imagem
});

// Rota para fazer o upload de uma imagem
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  // Enviar a URL do arquivo para o cliente
  res.status(200).send({
    message: 'File uploaded successfully',
    file: req.file,
    fileUrl: `/uploads/${req.file.filename}`,
  });
});

// Servir arquivos estáticos (imagens) da pasta 'uploads'
app.use('/uploads', express.static(uploadsDir));

// Roda o servidor na porta configurada
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
