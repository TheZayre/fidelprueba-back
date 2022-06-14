//Se importa las librerías.
const expose = require('./express');
const mongo = require('./mongo');

//Lógica que se realiza cuando se inicialice la base de datos.
mongo.onInitialize(() =>
{
	console.log("\x1b[32m", "running bd", "\x1b[37m");
});

//Lógica que se realiza cuando se inicialice el servidor.
expose.onInitialize(() =>
{
	console.log("\x1b[32m", "running services", "\x1b[37m");
});

//Lógica que se realiza cuando se realice una petición.
expose.onRequest((request) =>
{
	if (request.url.indexOf('?'))
        console.info("\x1b[33m" + "calling " + request.url.substring(0, request.url.indexOf('?')) + " with id " + request.id + "\x1b[37m");
	else
        console.info("\x1b[33m" + "calling " + request.url + "\x1b[37m");
});

//Se declara el formato en el que la respuesta va a ser devuelta.
expose.onResponse(({ request, response }) =>
{
	return {
		code: 200,
		description: "Service executed OK",
		data: response
	};
});

//Se declara el formato en el que el error va a ser devuelto.
expose.onError(({ code, message }) =>
{
	return { code: code ?? 500, description: message };
});

//Lógica que se realiza cuando finalice una petición.
expose.onEnd(({ request, code, data }) =>
{
	console.info("\x1b[33m" + "ending " + request.url + " with code " + code + " with id " + request.id + "\x1b[37m");
});


//Servicios
expose.get('/news', require("./services/news/get"));
expose.post('/archiveNew', require("./services/news/post"));
expose.del('/deleteArchived', require("./services/news/delete"));

//Inicializa base de datos
mongo.initialize();

//Inicializa el servidor en el puerto 9000.
expose.start(9000);