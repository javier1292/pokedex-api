'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = Schema({
    name: String,
    surname: String,
    email:String,
    password:String,
    image: String,
    whatsapp : String,
    ciudad : String
});
userSchema.methods.toJSON = function (){
    const obj = this.toObject();
    delete obj.password;
    return obj;
}
//lowcase y pluralizar el nombre
module.exports = mongoose.model('user',userSchema);
