'use strict';

const serverlessHTTP = require('serverless-http');
const express = require('express');
const app = express()
const bodyParser = require('body-parser')
let user_routes = require('../routes/user')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))


app.use((req, res, next) => {
   res.header('Access-Control-Allow-Origin', '*')
   res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method')
   res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
   res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE')
   next();
})

app.use('/api', user_routes);


module.exports.user = serverlessHTTP(app)