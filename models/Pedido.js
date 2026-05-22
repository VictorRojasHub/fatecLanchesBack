const mongoose = require('mongoose');

const PedidoSchema = new mongoose.Schema({
  id: { 
    type: Number, 
    required: true,
    unique: true
  },

  nome: { 
    type: String, 
    required: true 
  },

  status: { 
    type: String, 
    enum: ['Entregue', 'Pendente', 'Cancelado'],
    default: 'Pendente'
  },

  data: { 
    type: String, 
    required: true 
  },
  total: { 
    type: Number, 
    required: true 
  },

  itens: [
    {
      type: String
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Pedido', PedidoSchema);