const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userModel = require('../models/modelUser'); 

const login = async (email, password) => {
    const user = await userModel.getUserByEmail(email);
    if (!user) throw new Error('Usuario no encontrado');
  
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Contraseña incorrecta');
  
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
  
    return { token };
  };
  
  const register = async (email, password) => {
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) throw new Error('El email ya está registrado');
  
    const hashedPassword = await bcrypt.hash(password, 10);
    await userModel.createUser(email, hashedPassword);
  };
  
  module.exports = { login, register };
