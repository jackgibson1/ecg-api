// epxorts all DB connection configurations 
// connection pool used

const env = process.env.NODE_ENV; 

const development = { 
    HOST: "127.0.0.1", 
    PORT: 3306,
    USER: "root", 
    PASSWORD: "ecg123", 
    DB: "ecg-db",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    dialect: "mysql"
}

const production = { 
    HOST: "143.117.45.71", 
    PORT: 10000,
    USER: "root", 
    PASSWORD: "ecgprod123", 
    DB: "ecg-db",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    dialect: "mysql"
}

const config = { 
    development, 
    production
}; 

module.exports = config[env];