'use strict'

const mongoose = require('mongoose');
const mongoosepaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;




//Modelo de Pokemon
const PokemonSchema = Schema({
    nombre: String,
    nivel: String,
    tipo:String,
    comentario: String,
    imagen:String,
    user: {type: Schema.ObjectId, ref: 'user'},
});

//cargar paginacion 
PokemonSchema.plugin(mongoosepaginate);

module.exports = mongoose.model('Pokemon', PokemonSchema);