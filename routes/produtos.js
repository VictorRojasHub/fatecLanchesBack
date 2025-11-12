const express = require('express');
const router = express.Router();
const Produto = require('../models/Produto');
const auth = require('../middleware/authMiddleware');

// Criar novo produto (só admin futuramente)
router.post('/', auth, async (req, res) => {
  try {
    const novoProduto = new Produto(req.body);
    await novoProduto.save();
    res.status(201).json(novoProduto);
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao criar produto', detalhes: err.message });
  }
});

// Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const { categoria } = req.query //filtro opcional por categoria
    const filtro = categoria ? { categoria } : {}

    const produtos = await Produto.find(filtro)    
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar produtos' });
  }
});

module.exports = router;
