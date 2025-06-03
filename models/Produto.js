const mongoose = require('mongoose');

const ProdutoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descricao: String,
  preco: { type: Number, required: true },
  imagemUrl: String, // pode ser uma URL de imagem
  disponivel: { type: Boolean, default: true },
  categoria: { type: String, enum: ['Lanche', 'Bebida', 'Acompanhamento'], default: 'Lanche' }
});

module.exports = mongoose.model('Produto', ProdutoSchema);
