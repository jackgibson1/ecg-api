import { v4 as uuidv4 } from 'uuid';
import { jwtRefreshExpiration } from '../config/auth.config';

export default (sequelize, Sequelize) => {
  const RefreshToken = sequelize.define('refreshToken', {
    token: {
      type: Sequelize.STRING
    },
    expiryDate: {
      type: Sequelize.DATE
    }
  });

  RefreshToken.createToken = async (user) => {
    const expiredAt = new Date();
    expiredAt.setSeconds(expiredAt.getSeconds() + jwtRefreshExpiration);
    const token = uuidv4();
    const refreshToken = await this.create({
      token,
      userId: user.id,
      expiryDate: expiredAt.getTime()
    });
    return refreshToken.token;
  };

  RefreshToken.verifyExpiration = (token) => token.expiryDate.getTime() < new Date().getTime();
  return RefreshToken;
};
