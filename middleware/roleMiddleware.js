module.exports = (rolesPermitidas) => {
  return (req, res, next) => {
    if (!req.usuarioRole || !rolesPermitidas.includes(req.usuarioRole)) {
      return res.status(403).json({ 
        mensagem: 'Acesso negado: você não tem permissão para esta ação' 
      });
    }
    next();
  };
};