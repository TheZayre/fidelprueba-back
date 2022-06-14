const { MongoClient } = require("mongodb");

//Importación de variables de entorno.
require('dotenv').config();
let env = process.env;

const cluster = require('cluster');
let _onInitialize;

//Función para iniciarlizar la base de datos.
async function initialize()
{
    try{
    this.client = new MongoClient("mongodb://"+env.MONGO_URL);
    await this.client.connect().then( () =>{
        if(cluster.isMaster)
            _onInitialize?.()
    });

    this.mongo = this.client.db(env.MONGO_DB);
    }catch(e){
        if(cluster.isMaster)
            console.error("\x1b[31m"+ "bd error: " + e.message);
    }
    return this.mongo;
}

function onInitialize(callback)
{
    _onInitialize = callback;
}

//Obtención de instancia de base de datos.
function get()
{
    return this.mongo;
}

module.exports = {
    initialize, get, onInitialize
}