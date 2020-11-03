/*Aqui es donde vamos a crear registros, modificaciones, rliminar, etc(Para el usuario)*/
var User = require('../models/user');/*Traemos el modelo que acabamos de crear*/
var bcrypt = require('bcrypt-nodejs');/*Para incriptar las contraseñas*/

var jwt = require('../helpers/jwt'); /*Requerimos el token*/

var path= require('path')//Requerimos el modulo path, que es el encargado de
function registrar(req, res) {
    var params = req.body;/*Guarda indormacion de quien se esta regustrando*/
    var user = new User(); /*Vamos a utilizar siempre el mismo modelo*/

    user.nombre = params.nombre;
    user.email = params.email;
    user.imagen = null;
    user.telefono = '';
    user.bio = '';
    user.curso = 'undefined';
    user.estado = false;
    /*Si hay una contraseña en el envio de la peticion*/
    if (params.password) {/*Aqui se encripta*/
        bcrypt.hash(params.password, null, null, function (err, hash) {
            user.password = hash;/*Le digo que el modelo de mngoDB(Base de Datos) se va  almacenar la contraseña de una vez encriptada*/

            User.findOne({ email: params.email }, (err, user_data) => {
                if (!user_data) {/*Si no hay un usuario registrado con ese correo, lo vamos a registrar*/
                    user.save((err, user) => {
                        if (user) {
                            /*Me va a devolver el obeto de usuario*/
                            res.status(200).send({ user: user })
                            /*Si no se puede registrar en el usuario*/
                        } else {
                            res.status(404).send({ message: err })
                        }
                    })
                    /*Si esta registrado*/
                } else {
                    res.status(404).send({ message: "El correo ya esta registrado" })
                }
            });
        });
    } else {
        res.status(500).send({ message: 'Ingrese su contraseña' })
    }
}


function login(req, res) {
    var data = req.body; /*Recibe el usuario y la conrtraseña*/
    /*di el correo existe, qu elo traiga de la BD*/
    User.findOne({ email: data.email }, (err, user_data) => {
        if (err) {
            res.status(500).send()
            //500-el servidor de whatsapp de cayó
            //404-NO se encuentra la persona o el mensaje
            //200*cuando se enevia el mensaje correctamente
            res.status(500).send({ message: "Error en el servidor" });
        } else {
            if (!user_data) {//user_data es el email que se ngreso en el login, si no se encuentra en la BD, no se ha registrado
                res.status(404).send({ message: "El correo NO esta registrado" })
            } else {// Si se encontro el correo en la BD
                bcrypt.compare(data.password, user_data.password, function (err, check) {
                    if (check) {//Si son iguales las contraseñas
                        if (data.gettoken) {
                            res.status(200).send({
                                jwt: jwt.createToken(user_data),
                                user: user_data, //Me muestre la informacion del usuario
                                message: 'Este usuario tiene un token'
                            })
                        } else {
                            res.status(200).send({
                                jwt: jwt.createToken(user_data),
                                user: user_data,
                                message: 'Este usuario NO tiene un token'
                            });
                        }

                    }
                })
            }
        }
    })
}
/*Vamos a buscar un usuario ´para chatear con el*/
function get_user(req, res) {
    let id = req.params['id'];/*Estoy guardando el id que estoy buiscando*/
    User.findById(id, (err, user) => {
        if (err) {
            res.status(500).send({ message: 'Error en el servidor' })
        } else { /*Si encuentra una coincidencia*/
            if (user) { /*Si existe el usuario*/
                res.status(200).send({ user: user }) /*Muestra los datos del usuario*/
            } else {/*No existe esa persona*/
                res.status(500).send({ message: 'No existe un usuario con ese id' })
            }
        }
    })
}
function get_users(req, res){
User.find((err, users)=>{
    if (err) {
        res.status(500).send({message: 'Error en el servidor'})
    } else {
        if (users) {/*Si hay usuarios registrados que los muestre*/
            res.status(200).send({userd:users})
        } else {
            res.status(500).send({message: ' No existe ningun usuario'})
        }
}
})
}
function update_foto(req, res) {
    let id=req.params['id'];/*Capturamos el id donde se va a guardar la foto*/
    if (req.files.imagen){/*Si s esta cargando una imagen*/
 let imagen_path= req.files.imagen.path;/*Vamos a guardar la imagen en la ruta*/

 let name= imagen_path.split('\\');/*Separamos la ruta donde se encuentra la imagen para solo extraer su nombre*/
 
 let imagen_name = name[6];//uploads/perdiles/nombreimagen
 var nueva_ruta="./uploads/perfiles/"+ imagen_name + path.extname(imagen_path);
  User.findByIdAndUpdate(id, {imagen:nueva_ruta},function (err, user_update) {
      if (err) {
          res.status(500).send({message:'Error en el servidor'});
      } else {
        if (user_update) {//Si el usuario es actualizado correctamente
            console.log(name); 
            res.status(200).send({user: user_update}) //Me devuelve el usuario actualizado
            
        } else {
            res,status(500).send({message:'No se encontro el usuario'});
        }
      }
  })
}else{
    res.status(404).send({message:'No se cargo ninguna imagen'})
    }
}
function get_img(req,res){
var img= req.params['img'];//Traemos la solicitud de la imagen 
if (img !="null") {//Es diferente a vacioo null
    var path_img='./uploads/perfiles/'+img;//Traemos la ruta de la imagen
    res.status(200).sendFile(path.resolve(path_img));
} else {
    /*Si no hay una imagen*/
    var path_img= '/uploads/perfiles/default.png'
    res.status(200).sendFile(path.resolve(path_img));
}
}
function editar_config(req, res) {
    let id = req.params['id'];
    var data = req.body;
    /* VAN A VER 2 TIPOS DE ACTUALIZACIONES, UNA CUANDO SE ACTUALIZA CON IMAGEN Y OTRA SIN IMAGEN */

    if (req.files) { //Si hay una imagen si hay contraseña
        //vamos a validar si manda una contraseña
        if (data.password) {
            console.log('1') //opcion 1
            //encriptamos la contraseña recibida con el metodo hash
            bcrypt.hash(data.password, null, null, function(err, hash){
                let imagen_path= req.files.imagen.path; //obtenemos la ruta de la imagen
                let name= imagen_path.split('\\'); //convertimos en un arreglo
                let imagen_name= name[6]; //llamamos la posicion 2 el nombre
                if (err) { //si hay un error
                    res.status(500).send({ message: 'Error en el servidor' });
                }else{ //si hay una contraseña encriptada
                    //se van actualizar los siguientes datos
                    User.findByIdAndUpdate(id,{nombre: data.nombre, password: hash, imagen: imagen_name, telefono: data.telefono, bio:data.bio,curso: data.curso, estado: data.estado}, (err, user_data)=>{
                        if (user_data) { // si la actualizacion es correcto me devuelva el usuario que se actualizo
                            //response = representa la respuesta a una petición.
                           res.status(200).send({user: user_data}); 
                        }
                    })
                }
            })
        } else { // Sino hay una contraseña, pero si hay imagen, copiamos orginal y le borramos la contraseña encrypt y en User.find...
            console.log('2')
            let imagen_path= req.files.imagen.path; //obtenemos la ruta de la imagen
            let name= imagen_path.split('\\'); //convertimos en un arreglo
            let imagen_name= name[6]; //llamamos la posicion 2 el nombre
            
            User.findByIdAndUpdate(id,{nombre: data.nombre, imagen: imagen_name, telefono: data.telefono, bio:data.bio,curso: data.curso, estado: data.estado }, (err, user_data)=>{
                if (user_data) { // si la actualizacion es correcto me devuelva el usuario que se actualizo
                    //response = representa la respuesta a una petición.
                   res.status(200).send({user: user_data}); 
                }
            });

        }
    } else { //Si contraseña,no hay imagen, copiamos el original y borramos la seccion de la imagen
        if (data.password) {
            console.log('3')
                //encriptamos la contraseña recibida con el metodo hash
                bcrypt.hash(data.password, null, null, function(err, hash){
                   
                    if (err) { //si hay un error
                        res.status(500).send({ message: 'Error en el servidor' });
                    }else{ //si hay una contraseña encriptada
                        //se van actualizar los siguientes datos
                        User.findByIdAndUpdate(id,{nombre: data.nombre, password: hash, telefono: data.telefono, bio:data.bio,curso: data.curso, estado: data.estado }, (err, user_data)=>{
                            if (user_data) { // si la actualizacion es correcto me devuelva el usuario que se actualizo
                                //response = representa la respuesta a una petición.
                               res.status(200).send({user: user_data}) 
                            }
                        })
                    }
                })
        } else { //cuando no hay una contraseña ni imagen
            //copio le borro la contraseña de arriba
            User.findByIdAndUpdate(id,{nombre: data.nombre, telefono: data.telefono, bio:data.bio,curso: data.curso, estado: data.estado }, (err, user_data)=>{
                if (user_data) { // si la actualizacion es correcto me devuelva el usuario que se actualizo
                    //response = representa la respuesta a una petición.
                   res.status(200).send({user: user_data}) 
                }
            }) 
        }
    }
}
module.exports = {
    registrar,
    login,
    get_user,
    get_users,
    update_foto,
    get_img,
    editar_config
}
