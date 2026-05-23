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

// Edição de Produto (PUT)
router.put('/:id', auth, checkRole(['ADMIN_UNIDADE']), upload.single('imagem'), async (req, res) => {
  try {
    const { id } = req.params;
    let dadosAtualizados = { ...req.body };

    // 1. Verificar se o produto existe antes de tentar qualquer coisa
    const produtoExistente = await Produto.findById(id);
    if (!produtoExistente) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    // 2. Lógica de Imagem: Só envia para o Cloudinary se uma NOVA foto for enviada
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'fatec-lanches' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      // Substitui a URL da imagem antiga pela nova
      dadosAtualizados.imagem = uploadResult.secure_url;
    }

    // 3. Atualizar no MongoDB
    // { new: true } faz com que a função retorne o produto já com as mudanças
    const produtoAtualizado = await Produto.findByIdAndUpdate(
      id, 
      dadosAtualizados, 
      { new: true, runValidators: true }
    );

    res.json(produtoAtualizado);
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao atualizar produto', detalhes: err.message });
  }
});    
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