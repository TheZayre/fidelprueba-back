const bodyParser = require("body-parser");
const express = require("express");

const cluster = require('cluster');

let _onResponse;
let _onError;
let _onRequest;
let _onInitialize;
let _onEnd;

let threads = require('os').cpus().length;
let running = 0;

app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


function start(port)
{
    if (cluster.isMaster)
    {
        for (let i = 0; i < threads; i++)
            cluster.fork();

        cluster.on('message', () => {
            if (++running === threads) _onInitialize?.();
        });

    } else app.listen(port, () => process.send("OK"));
}

function get(endpoint, service)
{
    if (cluster.isWorker)
        app.get(endpoint, run(service));
}

function put(endpoint, service)
{
    if (cluster.isWorker)
        app.put(endpoint, run(service));
}

function post(endpoint, service)
{
    if (cluster.isWorker)
        app.post(endpoint, run(service));
}

function del(endpoint, service)
{
    if (cluster.isWorker)
        app.delete(endpoint, run(service));
}

function onInitialize(callback)
{
    _onInitialize = callback;
}

function onRequest(callback)
{
    _onRequest = callback;
}

function runRequest(request)
{
    return _onRequest?.(request);
}

function onResponse(callback)
{
    _onResponse = callback;
}

function runResponse(response)
{
    return _onResponse?.(response);
}

function onError(callback)
{
    _onError = callback;
}

function runError(error)
{
    return _onError?.(error);
}

function onEnd(callback)
{
    _onEnd = callback;
}

function runEnd(end)
{
    return _onEnd?.(end);
}

function run(service) { return async(req, res) =>
{
    let code;
    let data;

    try {

        // Asigna un valor único a la llamada de la API.
        req.id = parseInt(Math.random() * 1000000);

        // Se notifica que una llamada a API va a ser ejecutada.
        runRequest(req)

        // Se ejecuta la lógica del servicio del API.
        let response = await service(req);

        // Se notifica que la llamada a API ha sido ejecutada correctamente.
        response = runResponse({ request: req, response }) ?? response;

        // Se devuelve el dato resultado al servicio.
        code = 200;
        data = response;
        res.status(code).send(response);

    } catch (error) {

        // En caso de error, notifica que la llamada a API ha tenido error.
        error = runError(error) ?? error;

        // Se devuelve el dato resultado al servicio.
        code = 500;
        data = error;
        res.status(code).send(error);

    } finally {

        runEnd({ request: req, code, data });

    }
}}

module.exports = {
    start, get, put, post, del, onRequest, onError, onResponse, onInitialize, onEnd
}