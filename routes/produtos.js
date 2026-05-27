const express = require('express');
const router = express.Router();
const Produto = require('../models/Produto');
const auth = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// 1. ROTA DE CRIAR (POST)
router.post('/', auth, checkRole(['ADMIN_UNIDADE']), upload.single('imagem'), async (req, res) => {
  try {
    let imagemUrl = '';

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
      imagemUrl = uploadResult.secure_url;
    }

    const novoProduto = new Produto({
      ...req.body,
      imagemUrl: imagemUrl
    });

    await novoProduto.save();
    res.status(201).json(novoProduto);
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao criar produto', detalhes: err.message });
  }
});

// 2. ROTA DE EDITAR (PUT) - Agora fora do POST
router.put('/:id', auth, checkRole(['ADMIN_UNIDADE']), upload.single('imagem'), async (req, res) => {
  try {
    const { id } = req.params;
    let dadosAtualizados = { ...req.body };

    const produtoExistente = await Produto.findById(id);
    if (!produtoExistente) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

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
      dadosAtualizados.imagem = uploadResult.secure_url;
    }

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

router.get('/', async (req, res) => {
  try {
    const { categoria, ordem } = req.query; // Filtro opcional por categoria e ordenação
    const filtro = categoria ? { categoria } : {};
    
    // Define se a ordem é descendente (-1) ou ascendente (1) com base no preço
    const ordenando = ordem === 'desc' ? -1 : 1;
    
    const produtos = await Produto.find(filtro).sort({ preco: ordenando });
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar produtos' });
  }
});

module.exports = router;
