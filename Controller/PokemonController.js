"use strict";

const Pokemon = require("../model/pokemonModel");
const validator = require("validator");
const path = require("path");
const fs = require("fs");

const controller = {
  save: function (req, res) {
    //recoger los parametros por post
    const params = req.body;

    //validar los datos
  
      const validate_nombre = !validator.isEmpty(params.nombre);
      const validate_nivel = !validator.isEmpty(params.nivel);
      const validate_tipo = !validator.isEmpty(params.tipo);
      const validate_comentario = !validator.isEmpty(params.comentario);
      if (
        validate_nombre &&
        validate_nivel &&
        validate_tipo &&
        validate_comentario
      ) {
        //crear el objeto
        const pokemon = new Pokemon();
        //asignar valores
        pokemon.nombre = params.nombre;
        pokemon.nivel = params.nivel;
        pokemon.tipo = params.tipo;
        pokemon.comentario = params.comentario;
        pokemon.user = req.user.sub;

        //guardar el pokemon
        pokemon.save((err, pokemonStored) => {
          if (err) {
            return res.status(400).send({
              message: "No se pudo guardar el Pokemon",
            });
          }
          //devolcer respuesta
          return res.status(200).send({
            status: "success",
            pokemon: pokemonStored,
          });
        });
      } else {
        return res.status(400).send({
          message: "error al validar los datos",
        });
      }
  
  },
  list: function (req, res) {
    //recoger la pagina actual
    if (
      !req.params.page ||
      req.params.page == null ||
      req.params.page == 0 ||
      req.params.page == "0" ||
      req.params.page == undefined
    ) {
      var page = 1;
    } else {
      var page = parseInt(req.params.page);
    }
    //indicar las opciones de paginacion
    const opciones = {
      sort: { date: -1 },
      populate: "user",
      limit: 6,
      page: page,
    };
    //find paginado
    Pokemon.paginate({}, opciones, (err, pokemon) => {
      if (err) {
        return res.status(500).send({
          message: "error al hacer una consulta ",
        });
      }
      if (!pokemon) {
        return res.status(404).send({
          message: "Not found",
        });
      }
      //devolver resultado
      return res.status(200).send({
        status: "success",
        pokemon: pokemon.docs,
        totalDocs: pokemon.totalDocs,
        totalPages: pokemon.totalPages,
      });
    });
  },
  getPokemons: function (req, res) {
    //conseguir id de usuario
    const userid = req.params.user;

    // find con una condicion de usuaio
    Pokemon.find({ user: userid })
      .sort({ date: -1 })
      .exec((err, pokemon) => {
        if (err) {
          return res.status(400).send({
            message: "Error al buscar un pokemon",
          });
        }
        if (!pokemon) {
          return res.status(400).send({
            message: "este user no tiene pokemon registardo ",
          });
        }
        //devolver el resultado
        return res.status(200).send({
          status: "success",
          pokemon: pokemon,
        });
      });
  },
  detalllePokemon: function (req, res) {
    //sacr id del pokemon
    const pokemonid = req.params.id;

    // find por id del Pokemom
    Pokemon.findById(pokemonid)
      .populate("user")
      .exec((err, pokemon) => {
        if (err) {
          return res.status(400).send({
            message: "error al obtener el detalle",
            err,
          });
        }
        if (!pokemon) {
          return res.status(400).send({
            message: "no hay pokemon ",
          });
        } else {
          //devlver el resultado
          return res.status(200).send({
            status: "success",
            pokemon,
          });
        }
      });
  },
  update: function (req, res) {
    try {
      //recoger el id del pokemon
      const pokemonId = req.params.id;
      // recoger los datos que llegan desde el post
      const params = req.body;
      //validar los datos

      //montar  un json con los datos modificados
      const update = {
        nombre: params.nombre,
        nivel: params.nivel,
        tipo: params.tipo,
        comentario: params.comentario,
      };
      // find and update del pokemon por id de usuario
      Pokemon.findOneAndUpdate(
        { _id: pokemonId, user: req.user.sub },
        update,
        { new: true },
        (err, pokemonUpdated) => {
          if (err) {
            return res.status(400).send({
              message: "error en la peticion",
            });
          }
          if (!pokemonUpdated) {
            return res.status(400).send({
              message: "no se actualizo el pokemon ",
            });
          }

          //devolver respuesta
          return res.status(200).send({
            status: "success",
            pokemonUpdated,
          });
        }
      );
    } catch (ex) {
      return res.status(400).send({
        ex,
      });
    }
  },
  delete: function (req, res) {
    //sacra el id del Pokemon por url
    const pokemonId = req.params.id;
    //find and delete Pokemon by user id
    Pokemon.findByIdAndDelete(
      { _id: pokemonId, user: req.user.sub },
      (err, pokemonDeleted) => {
        if (err) {
          return res.status(400).send({
            status: "error",
            message: "error al borrar pokemon",
          });
        }
        if (!pokemonDeleted) {
          return res.status(400).send({
            status: "error",
            message: "no se encontro el pokemon",
          });
        }
        //devolver una respuesta
        return res.status(200).send({
          status: "success",
          pokemonDeleted,
        });
      }
    );
  },
  search: function (req, res) {
    //sacar el string a buscar de la url
    const search = req.params.search;
    //find or
    Pokemon.find({
      $or: [
        { nombre: { $regex: search, $options: "i" } }
      ],
    }).exec((err, pokemon) => {
      if (err) {
        return res.status(400).send({
          message: "error en la peticion ",
        });
      }
      if (!pokemon) {
        return res.status(404).send({
          message: "no hay pokemon disponibles ",
        });
      }
      return res.status(200).send({
        message: "success",
        pokemon,
      });
    });
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
      const pokemonid = req.params.id;
      //hacer el update para actualizar el opbjeto
      Pokemon.findByIdAndUpdate(
        { _id: pokemonid },
        { imagen: file_name },
        { new: true },
        (err, pokemonUpdate) => {
          if (err || !pokemonUpdate) {
            return res.status(500).send({
              message: "error al subir imagen ",
            });
          } else {
            //devolver una respusta
            return res.status(200).send({
              message: "uploaded",
              user: pokemonUpdate,
            });
          }
        }
      );
    }

    //comprobar el usuario identificado
  },
  getImagen: function (req, res) {
    const fileName = req.params.fileName;
    const pathfile = "./uploads/pokemon/" + fileName;
    console.log(pathfile);

    if (fs.existsSync(pathfile)) {
      return res.sendFile(path.resolve(pathfile));
    } else {
      return res.status(404).send({
        message: "la imagen no existe",
      });
    }
  },
};

module.exports = controller;
