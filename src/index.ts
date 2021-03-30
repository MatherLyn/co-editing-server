import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

const app = express();

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

let increasingUID: number = 0;

/**
 * Protocol:
 * 'n' means normal
 * 'w' means acknowledge a new client arrives
 * 'a' means acknowledge
 * 'b' means broadcast
 */
wss.on('connection', (ws: WebSocket) => {

    //connection is up, let's add a simple simple event
    ws.on('message', (message: string) => {

        //log the received message and send it back to the client
        console.log(`received: ${message}`);

        const protocol = message[0];
        const realMessage = message.replace(/^[abn]\:\s/, '');
        
        switch(protocol) {
            case 'n': {
                ws.send(`a: ${realMessage}`);
                break;
            }
            case 'a': {
                break;
            }
            case 'b': 
            case 's': {
                //send back the message to the other clients
                wss.clients.forEach(client => {
                    if (client != ws) {
                        client.send(message);
                    }
                });

                break;
            }
        }
    });

    //send immediatly a feedback to the incoming connection
    ws.send(`w: #${++increasingUID}`);
    console.log(`current clients: ${increasingUID}`);
    wss.clients.forEach(client => {
        if (client === ws) {
            return;
        }
        client.send(`w: #${increasingUID}`);
    });
});

//start our server
server.listen(process.env.PORT || 8889, () => {
    console.log(`Websocket Server started on port ${(server.address() as WebSocket.AddressInfo).port}`);
});