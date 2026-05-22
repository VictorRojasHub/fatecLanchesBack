const express = require('express');
const router = express.Router();
const Produto = require('../models/Produto');
const auth = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// Configuração básica do Multer (armazena em memória temporariamente)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Criar novo produto com Imagem
router.post('/', auth, checkRole(['ADMIN_UNIDADE']), upload.single('imagem'), async (req, res) => {
  try {
    let imagemUrl = '';

    // Se houver uma imagem no envio, faz o upload para o Cloudinary
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'fatec-lanches' }, // Cria uma pasta no seu Cloudinary
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      imagemUrl = uploadResult.secure_url;
    }

    // Cria o produto com os dados do corpo + a URL da imagem
    const novoProduto = new Produto({
      ...req.body,
      imagem: imagemUrl
    });

    await novoProduto.save();
    res.status(201).json(novoProduto);
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao criar produto', detalhes: err.message });
  }
});

// ... (mantenha sua rota GET de listagem aqui embaixo)

module.exports = router;