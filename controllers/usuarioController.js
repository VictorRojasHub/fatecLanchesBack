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
    const updates = { ...req.body };

    // Se o usuário estiver trocando a senha, precisamos criptografar de novo
    if (updates.senha) {
      const salt = await bcrypt.genSalt(10);
      updates.senha = await bcrypt.hash(updates.senha, salt);
    }

    // Usamos o req.user.id que o seu authMiddleware extrai do token
    const usuarioAtualizado = await Usuario.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-senha'); // Esconde a senha por segurança

    res.json({
      mensagem: "Perfil atualizado com sucesso!",
      usuario: usuarioAtualizado
    });
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao atualizar perfil', detalhes: err.message });
  }
};