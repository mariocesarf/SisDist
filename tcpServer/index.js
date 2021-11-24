// SERVIDOR
import net from 'net';
// import { storage } from "./RequestHandler.js"

const clientes = new Array();

let server = net.createServer((socket) => {
	socket.write('Echo server\r\n');
    socket.on('data', (data) => {
        console.log(data.toString())
    })
	socket.pipe(socket);
});


server.on('close',() => {
    console.log('Servidor fechado!');
});

server.on('connection', (socket) => {
    socket.on('data', (data) => {
        JSON.parse(data.toString());
        socket.write('Conectado com sucesso')
    })
    server.getConnections((error,count) => {
        console.log('Number of concurrent connections to the server : ' + count);
    });
      
})

server.listen(2222);

