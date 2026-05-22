const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const produtosRouter = require('./routes/produtos');
const auth = require('./routes/auth')
const pedidosRoutes = require('./routes/pedidosRoutes');


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Erro ao conectar no MongoDB:', err));

const usuarioRoutes = require('./routes/usuarioRoutes');

// Configuração de CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/auth', auth);
app.use('/pedidos', pedidosRoutes);
app.use('/usuarios', usuarioRoutes);

app.use('/api/produtos', produtosRouter);

module.exports = app;