const http = require('http');
const https = require('https');
const url = require('url');
const port = 8080;

const getProxyResponseHandler = (originalResponse) => {
    return (res) => {
        originalResponse.writeHead(res.statusCode, res.headers);

        res.on('data', (chunk) => {
            originalResponse.write(chunk);
        });

        res.on('end', () => {
            originalResponse.end();
        });
    };
};



const proxyErrorHandler = (err) => {
    console.error(`problem with request: ${err.message}`);
}


const requestHandler = (request, response) => {

    const urlObject = url.parse(request.url);

    const options = {
        host: urlObject.hostname,
        port: urlObject.port,
        path: urlObject.pathname,
        method: request.method,
        headers: request.headers,
        };


    const proxyRequest = http.request(options);

    request.on('data', (chunk) => {
        console.log(chunk.toString());
        proxyRequest.write(chunk);
    });

    request.on('end', () => {
        proxyRequest.end();
    });

    proxyRequest.on('response', getProxyResponseHandler(response));
    proxyRequest.on('error', proxyErrorHandler);
};


const server = new http.Server();
server.on('request', requestHandler);


server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    } console.log(`server is listening on ${port}`)
});

