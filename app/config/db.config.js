module.exports = { 
    HOST: "localhost:3360", 
    USER: "root", 
    PASSWORD: "ecg123", 
    DB: "ecg-db",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}