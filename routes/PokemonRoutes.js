'use strict'

var express = require('express');
var PokemonController = require('../Controller/PokemonController');

var router = express.Router();
var md_auth = require('../middleware/authenticate');
var multiparty = require('connect-multiparty');
var md_uploaad = multiparty({uploadDir: './uploads/pokemon'})


router.post('/pokemon', md_auth.authenticate, PokemonController.save);
router.get('/pokemon/:page?', md_auth.authenticate, PokemonController.list);
router.get('/user-pokemon/:user', PokemonController.getPokemons);
router.get('/pokemon/detalles/:id', PokemonController.detalllePokemon);
router.put('/pokemon/update/:id', md_auth.authenticate,PokemonController.update);
router.delete('/pokemon/delete/:id', md_auth.authenticate,PokemonController.delete);
router.get('/pokemon-search/:search', md_auth.authenticate, PokemonController.search);
router.post('/upload-pokemon/:id',[md_uploaad, md_auth.authenticate],PokemonController.upload);
router.get('/pokemon/img/:fileName',PokemonController.getImagen);
module.exports = router;