const http = require('http');
const url = require('url');
const port = 8080;

const getProxyResponseHandler = (originalResponse) => {
    let _originalResponse = originalResponse;
    return (res) => {
        // console.log(`STATUS: ${res.statusCode}`);
        // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');

        let body = "";

        res.on('data', (chunk) => {
            //console.log(chunk);
            body += chunk;
            _originalResponse.write(chunk);
        });

        res.on('end', () => {
            _originalResponse.end();
        });
    };
};



const proxyErrorHandler = (err) => {
    console.error(`problem with request: ${err.message}`);
}


const requestHandler = (request, response) => {
    // const options = {
    //     hostname: 'example.com',
    //     port: 80,
    //     method: 'GET',
    // };

    const urlObject = url.parse(request.url);
    for (const header in request.headers) {
        console.log(`"${header}": "${request.headers[header]}",`);
    }
    const options = {
        hostname: 'example.com',
        path: urlObject.path,
        port: 80,
        method: 'POST',
        headers: {
            "host": "example.com",
            "proxy-connection": "keep-alive",
            "cache-control": "max-age=0",
            "upgrade-insecure-requests": "1",
            "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36",
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
            // "accept-encoding": "gzip, deflate",
            // "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,sr;q=0.6",
        },
    };

    const proxyRequest = http.request(options);
    //console.log(proxyRequest);
    proxyRequest.on('response', getProxyResponseHandler(response));
    proxyRequest.on('error', proxyErrorHandler);
    proxyRequest.end();


    //response.end('Hello Node.js Server!');
};


const server = new http.Server();
server.on('request', requestHandler);


server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    } console.log(`server is listening on ${port}`)
});



// const http = require('http');
// const url = require('url');
// const port = 8080;

// const getProxyResponseHandler = (originalResponse) => {
//     const _originalResponse = originalResponse;
//     return (res) => {
//         // console.log(`STATUS: ${res.statusCode}`);
//         // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
//         res.setEncoding('utf8');

//         let body = "";

//         res.on('data', (chunk) => {
//             console.log(chunk);
//             body += chunk;
//             _originalResponse.write(chunk);
//         });

//         res.on('end', () => {
//             _originalResponse.end();
//         });
//     };
// };

// const proxyErrorHandler = (err) => {
//     console.error(`problem with request: ${err.message}`);
// }


// const requestHandler = (request, response) => {
//     const urlObject = url.parse(request.url);

//     const options = {
//         hostname: urlObject.hostname,
//         path: urlObject.path,
//         port: 80,
//         method: 'GET',
//         headers: request.headers,
//     };

//     let body = new Array;
//     request.on('data', (chunk) => {
//         console.log(chunk);
//         body.push(chunk);
//      });
//     request.on('end', () => {
//         //body = Buffer.concat(body).toString();
//         const proxyRequest = http.request(options);
//         proxyRequest.on('response', getProxyResponseHandler(response));
//         proxyRequest.on('error', proxyErrorHandler);
//         proxyRequest.end();
//     });



//     //response.end('Hello Node.js Server!');
// };


// const server = new http.Server();
// server.on('request', requestHandler);


// server.listen(port, (err) => {
//     if (err) {
//         return console.log('something bad happened', err)
//     } console.log(`server is listening on ${port}`)
// });