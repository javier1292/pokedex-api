"use strict";
const validator = require('validator');
const User = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("../services/jwt");
const fs = require("fs");
const path = require("path");
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';
const hash = bcrypt.hashSync(myPlaintextPassword, saltRounds);


const controller = {
  save: function (req, res) {
    //recoger los parametros de la peticion
    const params = req.body;

    try{
      //validar los datos
      const validate_name = !validator.isEmpty(params.name);
      const validate_surname = !validator.isEmpty(params.surname);
      const validate_email =
        !validator.isEmpty(params.email) && validator.isEmail(params.email);
      const validate_password = !validator.isEmpty(params.password);
      
      if (
        validate_name &&
        validate_surname &&
        validate_email &&
        validate_password
      ) {
        //crear objeto
        const user = new User();
  
        //asignar valores
        user.name = params.name;
        user.surname = params.surname;
        user.password = params.password;
        user.email = params.email.toLowerCase();
        user.whatsapp = params.whatsapp;
        user.ciudad = params.ciudad;
        user.imagen = null;
  
        //comprobar si el usuario ya existe
        User.findOne({ email: user.email }, (err, issetuser) => {
          if (err) {
            return res.status(400).send({
              message:
                "Ya existe un usuario con estta direccion de correo electronico ",
            });
          }
  
          if (!issetuser) {
            //cifrar la contraseña
              user.password = hash;
  
              //Guardar el usuario
              user.save((err, userStored) => {
                if (err) {
                  return res.status(400).send({
                    message: "Error al guardar el usurio ",
                  });
                }
  
                if (!userStored) {
                  return res.status(400).send({
                    message: "El usuario no se guardo ",
                  });
                }
  
                //devolver la respuesta
                return res.status(200).send({
                  message: "Usuario guardado correctamente ",
                  user: userStored,
                });
              });

          } else {
            return res.status(400).send({
              message: "Ya existe un usuario con este correo",
            });
          }
        });
      } else {
        //devolver la respuesta
        return res.status(400).send({
          message: "Llene los datos correctamente ",
        });
      }
    }catch(ex){

      return res.status(403).send({
        message: "Faltan datos",
      });
        
    }

  },
  login: function (req, res) {
    //recoger los parametros de la peticion
    const params = req.body;

    //validar datos
    const validate_email =
      !validator.isEmpty(params.email) && validator.isEmail(params.email);
    const validate_password = !validator.isEmpty(params.password);

    if (!validate_email && validate_password) {
      return res.status(400).send({
        message: "los datos son incorrectos ",
      });
    }
    //buscar usuarios que coincida con el email que nos llega
    User.findOne({ email: params.email.toLowerCase() }, (err, user) => {
      //comprobar si nos llega un error
      if (err) {
        return res.status(400).send({
          message: "User no encontrado ",
        });
      }

      //comprrbare si trae un usuario
      if (!user) {
        return res.status(400).send({
          message: "User no encontrado ",
        });
      }

      //si se encuentra
      //comprobar la password (coincidencia con email y password / bcrypt)
      bcrypt.compare(myPlaintextPassword, hash, (err, check) => {
        //si es correcto
        if (check) {
          //generar token con jwt
          if (params.gettoken) {
            // devolver los datos de login
            return res.status(200).send({
              message: "Login succes",
              user: user,
              token: jwt.createToken(user),
            });
          } else {
            //Limpiar el objeto
            user.password = undefined;
          }
        } else {
          return res.status(400).send({
            message: "los credenciales no son corre3ctas ",
          });
        }
      });
    });
  },
  update:async function (req, res) {
    try {

      //recoger los datos del usuari
      const params = req.body;
      //vaqlidar datos
     
  
      //eliminar propiedades innecesarias
      params.password && delete params.password;
      //user id
      const userId = req.user.sub;
  
      //comprobar el email
      if (req.user.email != params.email) {

        params.email && await User.findOne({ email: params.email  }, (err, user) => {

          if (err) {
            res.status(500).send({
              message: "error al intentar identificarse",
            });
          }
  
          if (user && user.email == params.email) {
            res.status(400).send({
              message: "el email no puede ser modificado",
            });
          }
        });


      } 

        //buscar y actualizar documentos de la base de datos
       await User.findOneAndUpdate(
          { _id: userId },
          params,
          { new: true },
          (err, userupdated) => {
            if (err) {
              res.status(500).send({
                message: "error al actualizar el user",
                user: userupdated,
              });
            }
  
            if (!userupdated) {
              res.status(500).send({
                message: "error",
                user: userupdated,
              });
            }else{
  
              //devolver respusta
              res.status(200).send({
                message: "update user",
                user: userupdated,
              });
            }
          }
        );
      
    } catch (err) {
      res.status(400).send({
        message: "faltan datos por enviar ",
        params,
      });
    }
  },
  upload: function (req, res) {
    //recoger el fichero de la peticion
    const filename = "avatar no subido.....";

    if (!req.files) {
      return res.status(404).send({
        status: "error",
        message: filename,
      });
    }
    //conseguir el nombre y la extencion del archivo subido
    const file_path = req.files.file0.path;
    const file_split = file_path.split("\\");
    //nombre del archivo
    const file_name = file_split[2];
    //extencion del archivo
    const ext_split = file_name.split(".");
    const file_ext = ext_split[1];
    //comprobar extension
    if (
      file_ext != "png" &&
      file_ext != "jpg" &&
      file_ext != "jpeg" &&
      file_ext != "gif"
    ) {
      fs.unlink(file_path, (err) => {
        return res.status(400).send({
          message: "la extencion del archivo no es valida",
        });
      });
    } else {
      // sacar el usuario identificado
      const userId = req.user.sub;
      //hacer el update para actualizar el opbjeto
      User.findByIdAndUpdate(
        { _id: userId },
        { image: file_name },
        { new: true },
        (err, userUpdate) => {
          if (err || !userUpdate) {
            return res.status(500).send({
              message: "error al subir imagen ",
            });
          } else {
            //devolver una respusta
            return res.status(200).send({
              message: "uploaded",
              user: userUpdate,
            });
          }
        }
      );
    }

    //comprobar el usuario identificado
  },
  avatar: function (req, res) {
    const fileName = req.params.fileName;
    const pathfile = "./uploads/users/" + fileName;
    console.log(pathfile);

    if (fs.existsSync(pathfile)) {
      return res.sendFile(path.resolve(pathfile));
    }else{
      return res.status(404).send({
        message: "la imagen no existe",
      });
    }
  },
  getusers: function(req, res){
    User.find().exec((err,users)=>{
      if (err || !users){
        return res.status(404).send({
          message: "Usuarios no encontrados"
        });
      }else{
        return res.status(200).send({
          status: "success",
          users
        });
      }
    });

  },
  getuser: function(req,res){
    const userId = req.params.userId;
    User.findById(userId).exec((err,user)=>{
      if (err || !user){
        return res.status(404).send({
          message: "Usuarios no encontrados"
        });
      }else{
        return res.status(200).send({
          status: "success",
          user
        });
      }

    });
  }
};

module.exports = controller;
