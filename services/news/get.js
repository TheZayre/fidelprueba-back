async function call({ query, body, headers, url })
{
    let data={};

    const mongo = require('../../mongo');
    
    //Llamada para obtener las noticias archivadas y no archivadas.
    data.noArchived = await mongo.get().collection("news").find({archiveDate: {$exists : false}}).sort({date: -1}).toArray();
    data.archived = await mongo.get().collection("news").find({archiveDate: {$exists : true}}).sort({archiveDate: -1}).toArray();
    
    // Devolución de datos del servicio.
	let result = { news: data };
	return result;
}

module.exports = call;