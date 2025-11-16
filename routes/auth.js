const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

router.get('/token', auth, (req, res) => {
  res.json({
    mensagem: req.mensagem,
  });
});

module.exports = router;
