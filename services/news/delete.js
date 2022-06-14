async function call({ query, body, headers, url })
{
    let data={};

    const mongo = require('../../mongo/mongo');
    var ObjectId = require('mongodb').ObjectId;

    //Llamada para obtener las noticias archivadas y no archivadas.
    try{
        data = await mongo.get().collection("news").deleteOne( {"_id": ObjectId(body.id)});
    } catch (e) {data=e}
    
    // Devolución de datos del servicio.
	let result = { data };
	return result;
}

module.exports = call;