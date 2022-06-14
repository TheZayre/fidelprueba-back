async function call({ query, body, headers, url })
{
    let data={};

    const mongo = require('../../mongo');
    var ObjectId = require('mongodb').ObjectId;

    //Se archiva la noticia.
    try{
        data = mongo.get().collection('news').updateOne({'_id':ObjectId(body.id)}, {$set: {archiveDate : new Date(body.archiveDate)}})
    } catch (e) {data=e}
    
    // Devolución de datos del servicio.
	let result = { data };
	return result;
}

module.exports = call;