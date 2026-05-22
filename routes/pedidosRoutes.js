const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');

router.get('/', async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ id: -1 });

    res.status(200).json(pedidos);
  } catch (error) {
    res.status(500).json({
      erro: 'Erro ao buscar pedidos'
    });
  }
});

router.get('/relatorio', async (req, res) => {
  try {

    // início do dia
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);

    // fim do dia
    const fimDia = new Date();
    fimDia.setHours(23, 59, 59, 999);

    // pedidos do dia
    const pedidos = await Pedido.find({
      createdAt: {
        $gte: inicioDia,
        $lte: fimDia
      }
    });

    // quantidade pedidos
    const totalPedidos = pedidos.length;

    // faturamento
    const faturamento = pedidos.reduce((acc, pedido) => {
      return acc + pedido.total;
    }, 0);

    // entregues
    const entregues = pedidos.filter(
      pedido => pedido.status === 'Entregue'
    ).length;

    // pendentes
    const pendentes = pedidos.filter(
      pedido => pedido.status === 'Pendente'
    ).length;

    res.status(200).json({
      data: new Date().toLocaleDateString('pt-BR'),
      totalPedidos,
      faturamento,
      entregues,
      pendentes
    });

  } catch (error) {
    res.status(500).json({
      erro: 'Erro ao gerar relatório'
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const ultimoPedido = await Pedido.findOne().sort({ id: -1 });

    const novoId = ultimoPedido ? ultimoPedido.id + 1 : 1000;

    const novoPedido = new Pedido({
      id: novoId,
      nome: req.body.nome,
      status:'Pendente',
      data: req.body.data,
      total: req.body.total,
      itens: req.body.itens
    });

    await novoPedido.save();

    res.status(201).json({
      mensagem: 'Pedido realizado com sucesso',
      id: novoPedido.id
    });

  } catch (error) {
    res.status(500).json({
      erro: 'Erro ao cadastrar pedido'
    });
  }
});

module.exports = router;