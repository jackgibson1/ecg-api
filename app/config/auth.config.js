// exports JWT secret key from environment variable
module.exports = {
  secret: process.env.JWT_SECRET,
  // jwtExpiration: 7200, // 2 hours
  jwtExpiration: 86400,
  jwtRefreshExpiration: 86400 // 24 hours
};
