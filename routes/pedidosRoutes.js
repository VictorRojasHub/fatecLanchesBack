const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');
const auth = require('../middleware/authMiddleware'); // <--- Segurança aqui!

// 1. Criar Pedido (POST) - Requer estar logado
router.post('/', auth, async (req, res) => {
  try {
    // Lógica de auto-incremento da Lizandra (melhorada)
    const ultimoPedido = await Pedido.findOne().sort({ id: -1 });
    const novoId = ultimoPedido ? ultimoPedido.id + 1 : 1000;

    const novoPedido = new Pedido({
      id: novoId,
      nome: req.body.nome,
      status: 'Pendente',
      data: req.body.data || new Date().toLocaleDateString('pt-BR'),
      total: req.body.total,
      itens: req.body.itens
    });

    await novoPedido.save();
    res.status(201).json({
      mensagem: 'Pedido realizado com sucesso',
      pedido: novoPedido
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao cadastrar pedido', detalhes: error.message });
  }
});

// 2. Relatório do Dia (GET) - Apenas para ADMIN ver
router.get('/relatorio', auth, async (req, res) => {
  try {
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);

    const fimDia = new Date();
    fimDia.setHours(23, 59, 59, 999);

    const pedidos = await Pedido.find({
      createdAt: { $gte: inicioDia, $lte: fimDia }
    });

    res.status(200).json({
      totalPedidos: pedidos.length,
      faturamento: pedidos.reduce((acc, p) => acc + p.total, 0),
      pedidos
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao gerar relatório' });
  }
});

module.exports = router;