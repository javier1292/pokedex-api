'use strict'
var jwt = require('jwt-simple');
var moment = require('moment');
var secret = "clave-ss12";


exports.authenticate = function(req, res, next){
   //comprobar si nos llega la cabezera de la autorizacion
   if(!req.headers.authorization){
    return res.status(403).send({
        message: "La peticion no tiene la cabezaera de auth"
    });
   }
   //limpiar el token y quitar comillas 
   var token = req.headers.authorization.replace(/['"]+/g,'');

   try{
       //decodificar token 
       var payload = jwt.decode(token, secret);

       //comprobar si el token ha expirado 
       if(payload.exp <= moment().unix()){

        return res.status(403).send({
            message: "El token a expirado"
        });
       }


   }catch(ex){
    return res.status(404).send({
        message: "token no es valido"
    });
   }


   //adjuntar  usuario identificadop 
   req.user = payload;

   // pasar la accion 
    next();

};