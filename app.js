const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const produtosRouter = require('./routes/produtos');



mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Erro ao conectar no MongoDB:', err));

const usuarioRoutes = require('./routes/usuarioRoutes');

app.use('/api/produtos', produtosRouter);

app.use(express.json());

app.use('/usuarios', usuarioRoutes);

module.exports = app;