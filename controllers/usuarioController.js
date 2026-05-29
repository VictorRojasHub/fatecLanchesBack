const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registrar = async (req, res) => {
  const { nome, email, senha, role } = req.body;
  const senhaHash = bcrypt.hashSync(senha, 10);
  try {
    // Se você quiser validar pelo e-mail aqui:
    // const papel = email.endsWith('@fatec.sp.gov.br') ? 'ADMIN_UNIDADE' : 'CLIENTE';
    
    const usuario = new Usuario({ nome, email, senhaHash, role: role || 'CLIENTE' });
    await usuario.save();
    res.status(201).json({ mensagem: 'Usuário criado' });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.login = async (req, res) => {
  const { email, senha } = req.body;
  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(404).json({ mensagem: 'Usuário não encontrado' });

    const senhaValida = bcrypt.compareSync(senha, usuario.senhaHash);
    if (!senhaValida) return res.status(401).json({ mensagem: 'Senha incorreta' });

    const token = jwt.sign({ id: usuario._id, role: usuario.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: usuario.role });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.atualizarPerfil = async (req, res) => {
  try {
    // Pegamos apenas o que veio no body
    const updates = { ...req.body };

    // SEGURANÇA: Removemos campos que NÃO podem ser alterados manualmente
    delete updates._id;
    delete updates.__v;
    delete updates.role; // Impede que um cliente se torne admin sozinho

    // 1. Tratamento da Senha
    if (updates.senha) {
      const salt = await bcrypt.genSalt(10);
      updates.senhaHash = await bcrypt.hash(updates.senha, salt);
      delete updates.senha; // Removemos o texto puro
    }

    // 2. Atualização usando o ID do seu Middleware (req.usuarioId)
    const usuarioAtualizado = await Usuario.findByIdAndUpdate(
      req.usuarioId,
      { $set: updates }, // Usamos $set para garantir que apenas esses campos mudem
      { new: true, runValidators: true }
    ).select('-senhaHash');

    if (!usuarioAtualizado) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    res.json({
      mensagem: "Perfil atualizado com sucesso!",
      usuario: usuarioAtualizado
    });

  } catch (err) {
    // Mande o erro real para o Postman para podermos ler o que aconteceu
    res.status(400).json({ 
      erro: 'Erro ao atualizar perfil', 
      detalhes: err.message 
    });
  }
};

exports.obterPerfil = async (req, res) => { 
  try {
    const usuario = await Usuario.findById(req.usuarioId).select('-senhaHash'); // Exclui a senha do resultado

    res.json(usuario);
    
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao obter perfil', detalhes: err.message });
  }
};