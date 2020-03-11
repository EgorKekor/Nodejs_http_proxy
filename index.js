const http = require('http');
const tls = require('tls');
const url = require('url');
var fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const httpPort = 8080;

const execOneCommand = async (command, i) => {
    try {
        const { stdout, stderr } = await exec(command, { cwd: './conf' });
        return;
    } catch (error) {
        //console.error(error);
    }
}

const execAllCommands = async (commands) => {
    await execOneCommand(commands[0], 0);
    await execOneCommand(commands[1], 1);
    await execOneCommand(commands[2], 2);
    await execOneCommand(commands[3], 3);
    await execOneCommand(commands[4], 4);
    return;
}

const generateOptionsByHostName = async (hostname) => {
    if (!(fs.existsSync("./conf/" + hostname + ".key") && fs.existsSync("./conf/" + hostname + ".crt"))) {
        const commands = [
            "openssl genrsa -out " + hostname + ".key " + " 2048",
            "openssl req -new -sha256 -key " + hostname + ".key -subj \"/C=US/ST=CA/O=MyOrg, Inc./CN=" + hostname + "\"" + " -out " + hostname + ".csr",
            "openssl req -in " + hostname + ".csr -noout -text",
            "openssl x509 -req -in " + hostname + ".csr -CA rootCA.crt -CAkey rootCA.key -CAcreateserial -out " + hostname + ".crt -days 500 -sha256",
            "openssl x509 -in " + hostname + ".crt -text -noout"];
        await execAllCommands(commands);
    }
    const options = {
        key: (() => {
            try {
                return fs.readFileSync("./conf/" + hostname + ".key")
            } catch (e) {
                //console.error(e);
            }
        })(),
        cert: (() => {
            try {
                return fs.readFileSync("./conf/" + hostname + ".crt")
            } catch (e) {
                //console.error(e);
            }
        })(),
        rejectUnauthorized: false
    };
    return options;
}

const requestHandler = (request, clientResponse) => {
    //console.log("HTTP handler");
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

    proxyRequest.on("error", (err) => {
        //console.log(`Http proxyRequest error: ${err}`);
    });

    proxyRequest.on("error", (err) => {
        //console.log(`Http request error: ${err}`);
    });

    request.pipe(proxyRequest);
};

const proxy = http.createServer(requestHandler);
proxy.on('error', (err) => {
    //console.log(`Proxy server error: ${err}`);
});

proxy.on('connect', async (req, cltSocket, head) => {
    cltSocket.write('HTTP/1.1 200 Connection Established\r\n' +
        'Proxy-agent: Node.js-Proxy\r\n' +
        '\r\n', async () => {
            const tlsOptions = {
                key: fs.readFileSync('./conf/rootCA.key'),
                cert: fs.readFileSync('./conf/rootCA.crt'),
                isServer: true,
            };

            const tlsSocket = new tls.TLSSocket(cltSocket, tlsOptions);
            tlsSocket.on('error', (err) => {
                //console.log(`$TLSSocket error: ${err}`);
            });

            const { port, hostname } = new url.URL(`http://${req.url}`);
            let options;
            try {
                options = await generateOptionsByHostName(hostname);
            } catch (err) {
                //console.log(err);
            }

            try {
                const srvSocket = tls.connect(port || 80, hostname, options, () => {
                    if (srvSocket.authorized) {
                        //console.log(`${hostname} - ++++`);
                    } else {
                        //console.log(`${hostname} - ----`);
                    }
                    srvSocket.write(head);
                    srvSocket.pipe(tlsSocket);
                    tlsSocket.pipe(srvSocket);
                });
                srvSocket.on('error', (err) => {
                    //console.log(`$SrvSocket error: ${err}`);
                });
            } catch (err) {
                //console.log(err);
            }
        });
});

proxy.listen(httpPort, (err) => {
    if (err) {
        return console.log('something bad happened in http', err)
    }
    console.log(`http server listen on port ${httpPort}`);
});








