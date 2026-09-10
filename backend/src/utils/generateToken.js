import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'vision2system_jwt_secret_key_2026', {
    expiresIn: '7d'
  });
};
