const http = require('http');
const tls = require('tls');
const net = require('net');
const url = require('url');
var fs = require('fs');
const httpPort = 8080;
const tlsPort = 8081;


const requestHandler = (request, clientResponse) => {
    console.log("HTTP handler");
    const urlObject = url.parse(request.url);

    const options = {
        host: urlObject.hostname,
        port: urlObject.port,
        path: urlObject.pathname,
        method: request.method,
        headers: request.headers,
    };

    const proxyRequest = http.request(options, (serverResponse) => {
        clientResponse.writeHead(serverResponse.statusCode, serverResponse.headers);
        serverResponse.pipe(clientResponse);
    });
    request.pipe(proxyRequest);
};



const tlsServerOptions = {
    key: fs.readFileSync('rootCA.key'),
    cert: fs.readFileSync('rootCA.crt'),
    passphrase: 'qqqq'
};

const tlsUncoderServer = tls.createServer(tlsServerOptions, (cltSocket) => {
    cltSocket.on('data', (chunk) => {
        console.log(chunk.toString('ascii'));
    });
});

tlsUncoderServer.listen(tlsPort, (err) => {
    if (err) {
        return console.log('something bad happened in tls server', err)
    }
    console.log(`tls decoder server listen on port ${httpPort}`);
});



const proxy = http.createServer(requestHandler);
proxy.on('connect', (req, cltSocket, head) => {
    const { port, hostname } = new url.URL(`http://${req.url}`);
    // console.log("CONNECT method");
    // console.log(`port:${port} hostname:${hostname}`);

    const tlsOptions = {
        key: fs.readFileSync('rootCA.key'),
        cert: fs.readFileSync('rootCA.crt'),
        passphrase: 'qqqq',
        rejectUnauthorized: false
    };

    const decoderSocket = tls.connect(8081, '127.0.0.1', tlsOptions, () => {

        cltSocket.write('HTTP/1.1 200 Connection Established\r\n' +
            'Proxy-agent: Node.js-Proxy\r\n' +
            '\r\n');


        decoderSocket.write(head);
        cltSocket.pipe(decoderSocket);

        //decoderSocket.pipe(cltSocket);
    });



    // const options = {
    //     key: fs.readFileSync('./anita_crt/google_com.key'),
    //     cert: fs.readFileSync('./anita_crt/google_com.crt'),
    //     rejectUnauthorized: false
    // };

    // const srvSocket = tls.connect(port || 80, hostname, options, () => {
    //     if (srvSocket.authorized) {
    //         console.log("Connection authorized by a Certificate Authority.");
    //     } else {
    //         return;
    //     }

    //     // cltSocket.write('HTTP/1.1 200 Connection Established\r\n' +
    //     //     'Proxy-agent: Node.js-Proxy\r\n' +
    //     //     '\r\n');

    //     srvSocket.write(head);
    //     srvSocket.pipe(cltSocket);
    //     cltSocket.pipe(srvSocket);

    //     // cltSocket.on('data', (chunk) => {
    //     //     console.log(chunk.toString('ascii'));
    //     // });

    //     // srvSocket.on('data', (chunk) => {
    //     //     console.log(chunk.toString('ascii'));
    //     // });
    // });
});

proxy.listen(httpPort, (err) => {
    if (err) {
        return console.log('something bad happened in http', err)
    }
    console.log(`http server listen on port ${httpPort}`);
});








