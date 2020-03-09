const http = require('http');
const https = require('https');
const net = require('net');
const url = require('url');
const basePort = 8080;
const httpPort = 8081;
const httpsPort = 8082;

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
    console.log("1111");
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

httpsRequestHandler = (request, response) => {
    console.log("2222");
    response.end("papi para pa pa pu");
}


const httpServer = new http.Server();
httpServer.on('request', requestHandler);
httpServer.listen(httpPort, (err) => {
    if (err) {
        return console.log('something bad happened in http', err)
    }
});

const httpsServer = new https.Server();
httpsServer.on('request', requestHandler);
httpsServer.listen(httpsPort, (err) => {
    if (err) {
        return console.log('something bad happened in https', err)
    }
});



net.createServer((conn) => {
    conn.once('data', function (buf) {
        const proxyPort = (buf[0] === 67) ? httpsPort : httpPort;
        console.log(buf);
        console.log(buf[0]);
        var proxy = net.createConnection(proxyPort, () => {
            proxy.write(buf);
            conn.pipe(proxy).pipe(conn);
        });
    });
}).listen(basePort, (err) => {
    if (err) {
        return console.log('something bad happened in main', err)
    } console.log(`httpServer is listening on ${basePort}`)
});


//https.createServer(httpsOptions, httpsConnection).listen(httpsAddress);



