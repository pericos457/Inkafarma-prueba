const userService = require('../services/userService');

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const result = await userService.login(email, password);
      res.status(200).json({ message: 'Login exitoso', token: result.token });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  };
  
  const register = async (req, res) => {
    const { email, password } = req.body;
    try {
      await userService.register(email, password);
      res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  module.exports = {
    login,
    register,
  };