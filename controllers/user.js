'use strict';
var CryptoJS = require("crypto-js");
let configDB = require('../conectDB/dynamoDB')
const USERS_TABLE = process.env.USERS_TABLE;
const CREDITOS_TABLE = process.env.CREDITOS_TABLE;
const BANCO_TABLE = process.env.BANCO_TABLE;
let dynamoDB = configDB.DB();
const pruebas = (req, res) => {
    res.send('Hola mundo con expressjs');
}




const saveUser = async (req, res) => {
    let {userId, name, monto, email, aprobado} = req.body;
    if (aprobado == 1) {
      aprobado = 'true'
      console.log('aprobado', aprobado)
    } else {
      aprobado = 'false'
      console.log('aprobado', aprobado)
    }
    let aprobadoUser;
    const bancoId = '123456'
    let montoBanco;
    let montoDescont = monto;
    const Id = CryptoJS.AES.encrypt(userId, email).toString();
    const estado = 'pendiente';
    const params = {
        TableName: USERS_TABLE,
        Item: {
          userId, name, monto, email, aprobado
        },
        Key: {
            userId: userId, 
        }
    };


    const paramsCredito = {
        TableName: CREDITOS_TABLE,
        Item: {
          Id, monto, aprobado, userId, estado
        }
    };


    const paramsBanco = {
        TableName: BANCO_TABLE,
        Key: {
          Id: bancoId,
        }
    }


    dynamoDB.get(paramsBanco, (error, result) => {
        const {monto} = result.Item;
        montoBanco = monto;
        if (montoBanco <= 0 || montoBanco < montoDescont) {
          res.status(200).json({
            error: 'No hay plata en el banco',
            montoBanco: false
         })
        } else {
          dynamoDB.get(params, (error, result, next) => {
            if(error){
              res.status(400).json({
                    error: 'No se ha podido acceder el usuario'
              })
            } else {
                if(result.Item) {
                  console.log('item',result.Item)
                    aprobadoUser = result.Item.aprobado; 
                    if(aprobadoUser === 'true'){
                      console.log('item aprobado',result.Item.aprobado)
                        dynamoDB.put(paramsCredito, (error) => {
                          montoBanco = montoBanco - montoDescont
                          updateBanco(montoBanco, '123456')
                          if(error) {
                              console.log(error);
                              res.status(400).json({
                                error: 'No se ha podido crear el credito'
                              })
                            } else {
                              res.status(200).json({
                                error: 'credito creado'
                              })
                            }
                        });
                    } else {
                        res.status(200).json({
                            error: 'El usuario ya existe con este userId y no puede tener creditos',
                            aprobado: false,
                            existe: false
                        })
                    }
                } else {
                    dynamoDB.put(params, (error) => {
                        if(error) {
                            console.log(error);
                            res.status(400).json({
                              error: 'No se ha podido acceder el usuario'
                            })
                          } else {
                            if (aprobado === 'false') {
                              res.status(200).json({
                                message: 'usuario registado',
                                aprobado: false,
                                nuevo: true
                              })
                            }
                          }
                         
                    });
                }
    
                if(aprobadoUser === 'true'){
                  console.log('es esteeee')
                  montoBanco = montoBanco - montoDescont
                  updateBanco(montoBanco, '123456')
                  dynamoDB.put(paramsCredito, (error) => {
                    if(error) {
                        console.log(error);
                        res.status(400).json({
                          error: 'No se ha podido crear el credito'
                        })
                      } else {
                         res.status(200).json({
                             message: 'credito y usuario registado',
                        
                         })
                      }
                  });
              }
            }
        });
        }
    });
  
}


const updateBanco =  (valor, key) => {
    let monto = valor;
    let Id = key;
    console.log('monto', monto)
    const paramsBanco = {
        TableName: BANCO_TABLE,
        Item: {
          Id, monto
        }
    };


    dynamoDB.put(paramsBanco, (error) => {
        return {Id, monto};
    })

}

const allUsers = async (req, res) => {
  const params = {
      TableName: USERS_TABLE,
    }
    dynamoDB.scan(params, (error, result) => {
      if(error) {
        console.log(error);
        res.status(400).json({
          error: 'No se ha podido crear el usuario'
        })
      } else {
        const {Items} = result;
        res.json({
          succes: true,
          message: 'Usuarios cargados correctamente',
          users: Items
        });
      }
    });
}


const user = async (req, res) => {
  const params = {
      TableName: USERS_TABLE,
      Key: {
        userId: req.params.userId,
      }
    }
  
    dynamoDB.get(params, (error, result) => {
      if(error) {
        console.log(error);
        res.status(400).json({
          error: 'No se ha podido acceder el usuario'
        })
      } 
      if (result.Item) {
        const {userId, name} = result.Item;
        return res.json({
          succes: true,
          message: 'Usuario cargado correctamente',
          user: {userId, name}
        });
      } else {
        res.status(404).json({
          error: 'No se ha podido encontrar el usuario'
        })
      }
    });
}




const aprobado = async (req, res) => {
console.log('rq', req.params.aprobado)
   if (req.params.aprobado == 1){
     req.params.aprobado = 'true'
   } else {
     req.params.aprobado = 'false'
   }
   console.log('rq', req.params.aprobado)
  const params = {
      TableName: USERS_TABLE,
      Key: {
         aprobado: req.params.aprobado,
      }
    }
  
    dynamoDB.scan(params, (error, result) => {
      if(error) {
        res.status(400).json({
          error: 'No se ha podido acceder el usuario'
        })
      } 
      const filter = [];
      if (result) {
        if (req.params.aprobado) {
            for(let i = 0; i < result.Items.length; i++ ) {
                if(result.Items[i].aprobado === req.params.aprobado){
                  filter.push(result.Items[i])
                }
            }
            res.status(200).json({
              succes: true,
              message: 'Usuarios cargados correctamente',
              users: filter
            });
        } else {
          res.status(400).json({
              error: 'No se ha podido acceder el usuario'
          })
        }
      } else {
        res.status(404).json({
          error: 'No se ha podido encontrar el usuario'
        })
      }
    });
}


const detailUser = async (req, res) => {
  
  const params = {
     TableName: CREDITOS_TABLE,
     Key: {
         userId: req.params.userId
     }
  }
    
    dynamoDB.scan(params, (error, result) => {
      if(error) {
        console.log(error);
        res.status(400).json({
          error: 'No se ha podido crear el usuario'
        })
      } 
      const filter = [];
      if (result) {

        if (req.params.userId) {
          for(let i = 0; i < result.Items.length; i++ ) {
              if(result.Items[i].userId === req.params.userId){
                filter.push(result.Items[i])
              }
          }
          res.status(200).json({
              succes: true,
              message: 'detalle de usuario cargados correctamente',
              users: filter
            });
        } else {
          res.status(400).json({
              error: 'No se ha podido acceder el usuario'
          })
        }
          
      } else {
        res.status(404).json({
          error: 'No se ha podido encontrar creditos a este usuario'
        })
      }
  
    });
}


const montoBanco = async (req, res) => {
const params = {
    TableName: BANCO_TABLE,
    Key: {
      Id: req.params.bancoId,
    }
  }

  dynamoDB.get(params, (error, result) => {
    if(error) {
      console.log(error);
      res.status(400).json({
        error: 'No se ha podido acceder el usuario'
      })
    } 
    if (result.Item) {
      const {Id, monto} = result.Item;
      return res.json({
        succes: true,
        message: 'Banco cargado correctamente',
        banco: {Id, monto}
      });
    } else {
      res.status(404).json({
        error: 'No se ha podido encontrar el usuario'
      })
    }
  });
}


const pagarCredito = async (req, res) => {

const {Id, monto, aprobado, userId, estado } = req.body;


const paramsCredito = {
    TableName: CREDITOS_TABLE,
    Item: {
      Id, monto, aprobado, userId, estado
    }
};


dynamoDB.put(paramsCredito, (error) => {
    if (error) {
        console.log(error);
        res.status(404).json({
          error: 'No se ha podido actualizar el credito'
        })
      } else {
        res.json({Id, monto, aprobado, userId, estado});
      }
})


}






module.exports = {
    pruebas,
    saveUser,
    allUsers,
    user,
    aprobado,
    detailUser,
    montoBanco,
    pagarCredito
}

