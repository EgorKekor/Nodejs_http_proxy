const http = require('http');
const url = require('url');
const port = 3000;

const proxyResponseHandler = (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');

    let body = "";

    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.info(body);
    });
};

const proxyErrorHandler = (err) => {
    console.error(`problem with request: ${err.message}`);
}


const requestHandler = (request, response) => {
    console.log(request.url);
    console.info(request.constructor);

    // const options = {
    //     hostname: 'http://www.ng.ru',
    //     port: 80,
    //     method: 'GET',
    // };

    // const proxyRequest = http.request(new url.URL('http://abc:xyz@example.com'));
    // proxyRequest.on('response', proxyResponseHandler);
    // proxyRequest.on('error', proxyErrorHandler);
    // proxyRequest.end();
    request.on('response', proxyResponseHandler);
    request.on('error', proxyErrorHandler);
    request.end();

    response.end('Hello Node.js Server!')
};


const server = new http.Server();
server.on('request', requestHandler);


server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    } console.log(`server is listening on ${port}`)
});