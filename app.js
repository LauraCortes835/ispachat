/*Va conectada la base de datos, http*/
var bodyparser=require("body-parser");/*Traer los metodos http*/
var mongoose=require("mongoose");/*Me permite hacer la conexion a la base de datos*/

/*Creamos el puerto */
var port=process.env.PORT|| 4201;

/*Inicializar express*/
 
var express=require("express");
var app= express()/*Llamo mla funcion express*/

var user_routes=require('../back/routes/user');/*Llamamos el archivo de nuestra ruta*/
var message_routes= require('./routes/message');//Llammamos las rutas
const { update_foto } = require("./controllers/userController");
const userController = require("./controllers/userController");

/*Creamos el servidor para que trabaje con los metodos http y las funciones de express*/
var server= require("http").createServer(app);

/*Envio de datos en tiempo real utilizando el servidor*/
var io=require('socket.io')(server);

/*Utilizo socket para validar que estoy conectada al servidor (En linea)*/
io.on('connection', function(socket){

    console.log("Usuario conectado");
})

/*Conexion a la Bd,primero la url donde mingo funciona, */
mongoose.connect('mongodb://localhost:27017/messengerdb', (err)=>{
    if (err) {/*Si hay un error*/
        throw err;/*Muestra especificamente el error que hay*/
    } else { /*Si nos conectamos*/
        console.log ("Conectados a la BD");
        app.listen(port, function(){ /*En que puesto estamos trabajando*/
            console.log ("Estamos trabajando en el puerto "+ port);
        })
    }
})


app.use(bodyparser.urlencoded({extended:true})); /*Aqui viaja el cuerpo de la peticion, en este caso : el registro del formulario*/
 app.use(bodyparser.json())/*Le decimos que el formato de envio de datos va a ser un JSON*/
 app.use('/api',user_routes);/*En nuestra aplicacion vamos a utilizar esas rutas*/
 app.use('/api',message_routes);

 
module.exports=app;