const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nome: String,
  email: { type: String, unique: true },
  senhaHash: String,
  // Adicionando o papel do usuário
  role: { 
    type: String, 
    enum: ['CLIENTE', 'ADMIN_UNIDADE'], 
    default: 'CLIENTE' 
  }
});

module.exports = mongoose.model('Usuario', usuarioSchema);