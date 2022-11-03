const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'hogehoge',
    database: 'checker'
});

const mysqlPromise = async (query, arr) => {
    const result = await new Promise((resolve, reject) => {
        if (arr) {
            connection.query(
                query,
                arr,
                (error, result) => {
                    resolve(result);
                }
            );
        }
        connection.query(
            query,
            (error, result) => {
                resolve(result);
            }
        );
    });
    return result;
};

module.exports = mysqlPromise;
