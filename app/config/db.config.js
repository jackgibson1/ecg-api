// epxorts all DB connection configurations 
// connection pool used

module.exports = { 
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