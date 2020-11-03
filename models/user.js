var mongoose=require('mongoose'); /*Conexion a la BD*/
var Schema = mongoose.Schema;/*Creamos la variable que va a enviar el modelo a Mongo*/
 var userSchema=Schema({
nombre:String,
email: String,
password:String,
imagen: String,
telefono: String,
biografia:String,
curso: String,
estado:Boolean /*Estado de conexion a la plataforma*/
});

module.exports=mongoose.model('user',userSchema)