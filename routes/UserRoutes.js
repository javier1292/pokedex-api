'use strict'

const express = require('express');
const UserController = require('../Controller/UserController');

const routes = express.Router();
const md_auth = require('../middleware/authenticate');
const multiparty = require('connect-multiparty');
const md_uploaad = multiparty({uploadDir: './uploads/users'})

//rustas de usuarios 
routes.post('/register',UserController.save);
routes.post('/login',UserController.login);
routes.post('/uploadAvatar',[md_uploaad, md_auth.authenticate],UserController.upload);
routes.post('/user/update',md_auth.authenticate,UserController.update);
routes.get('/avatar/:fileName',UserController.avatar);
routes.get('/users',UserController.getusers);
routes.get('/user/:userId',UserController.getuser);
 
module.exports = routes;