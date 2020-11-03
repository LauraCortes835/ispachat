var Message= require('../models/message');//Traigo el modelo del mensaje

function send(req, res) {
    var data=req.body; //Recibe todo el cuerpo del mensaje
 var message=new Message(); /* Traido el modelo para poderlo registrar con esa caracteristicas */
 message.de=data.de;
 message.para= data.para;/*El para del modelo y el para del formulario*/
 message.msm= data.msm;
  
 message.save((err,message_save)=>{
     if (err) {
         res.status(500).send({message:'Error en el servidor'});
     } else {
         if (message_save) {//Si fue guardado correctamente
          res.status(200).send({message:message_save})//Me va a devolver el cuerpo del mensaje*/             
         }
     }
 })

}
function data_msm(req, res){
var data= req.body; /*Guarda quien le envio y quien recibio para mostrarlo en pantalla*/
var de= req.params['de'];/*Quien lo envio*/
var para= req.params['para'];/*Quien lo recibio*/
const filtro = { // Me filtrara los mensajes como messeger y de whatsapp
    '$or': [
        {
            '$and': [
                {
                    'para': de
                }, {
                    'de': para
                }
            ]
        }, {
            '$and': [
                {
                    'para': para
                }, {
                    'de': de
                }
            ]
        },	
    ]
}

Message.find(filtro).sort({createAt: 1}).exec(function(err, messages){
    if (messages) {/*SI hay mensajes entre esas dos personas*/
        res.status(200).send({messages:messages});
    }else{
res.status(404).send({message:'No hay ningun mensaje entre estos usuarios'})
    
    }
})

}

module.exports={
    send,
    data_msm
}