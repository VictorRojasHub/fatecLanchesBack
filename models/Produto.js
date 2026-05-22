const mongoose = require('mongoose');

// models/Produto.js
const produtoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  preco: { type: Number, required: true },
  categoria: { type: String, required: true },
  descricao: String,
  imagem: String, // Aqui guardaremos a URL do Cloudinary
  unidadeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unidade' } // Para o role de admin de unidade
}); 




// O nome aqui deve ser igual ao da linha 4 (produtoSchema)
module.exports = mongoose.model('Produto', produtoSchema);
