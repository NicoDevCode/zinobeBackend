const AWS = require('aws-sdk');
const IS_OFFLINE = process.env.IS_OFFLINE;

const DB = () => {
    let dynamoDB;
    if (IS_OFFLINE === 'true') {
      return dynamoDB = new AWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8002'
      });
    } else {
     return dynamoDB = new AWS.DynamoDB.DocumentClient();
    }
}

module.exports = {
   DB
}