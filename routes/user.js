'use strict';

let express = require('express')
let UserController = require('../controllers/user')
let api = express.Router();

api.get('/prueba', UserController.pruebas)
api.post('/user', UserController.saveUser)
api.get('/users', UserController.allUsers)
api.get('/users/:userId', UserController.user)
api.get('/users/aprobados/:aprobado', UserController.aprobado)
api.get('/users/creditos/:userId', UserController.detailUser)
api.get('/users/banco/:bancoId', UserController.montoBanco)
api.post('/users/estado', UserController.pagarCredito)
module.exports = api;