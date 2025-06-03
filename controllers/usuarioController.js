const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registrar = async (req, res) => {
  const { nome, email, senha } = req.body;
  const senhaHash = bcrypt.hashSync(senha, 10);
  try {
    const usuario = new Usuario({ nome, email, senhaHash });
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

    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json(err);
  }
};