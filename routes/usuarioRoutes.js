const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuarioController');
const auth = require('../middleware/authMiddleware'); // Adicione o middleware

router.post('/registrar', controller.registrar);
router.post('/login', controller.login);

// Nova rota para atualizar o perfil (precisa estar logado)
router.put('/perfil', auth, controller.atualizarPerfil);
router.get('/perfil', auth, controller.obterPerfil); // Rota para obter os dados do perfil

module.exports = router;