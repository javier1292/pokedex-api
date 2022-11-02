"use strict";

var mongoose = require("mongoose");
var app = require("./app");
var port = process.env.PORT || 3999;

mongoose.set("useFindAndModify", false);
mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false );

mongoose
  .connect("mongodb://127.0.0.1:27017/api_pokedex", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Conectado");


    //crear el servidor 
    app.listen(port,()=>{
        console.log('el servidor esta arriba ')
    })
  })
  .catch((error) => console.log(error));
