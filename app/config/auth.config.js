// exports JWT secret key from environment variable
module.exports = { 
    secret: process.env.JWT_SECRET,
    // jwtExpiration: 3600, // 1 hour 
    // jwtRefreshExpiration: 86400, // 24 hours 

    jwtExpiration: 30, // 1 minute
    jwtRefreshExpiration: 60, // 2 minutes
    
} 