const express = require('express');
const router = express.Router();
const Produto = require('../models/Produto');
const auth = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware'); // Importando o novo middleware

// Criar novo produto - Protegido por Token e por Role
// Apenas usuários com a role 'ADMIN_UNIDADE' podem acessar
router.post('/', auth, checkRole(['ADMIN_UNIDADE']), async (req, res) => {
  try {
    const novoProduto = new Produto(req.body);
    await novoProduto.save();
    res.status(201).json(novoProduto);
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao criar produto', detalhes: err.message });
  }
});

// Listar todos os produtos - Aberto ao público
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