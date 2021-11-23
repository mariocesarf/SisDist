// CLIENTE
import readline from 'readline'
const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

import dgram from 'dgram';
import { Buffer } from 'buffer';

const client = dgram.createSocket('udp4');
const server = dgram.createSocket('udp4');



terminal.question(`Insira sua operação: `, op => {
    const message = Buffer.from(op)
    
    client.send(message, 8080, '0.0.0.0', (err) => {
        client.close()
    });

    terminal.close()
})


server.on('message', (msg, rinfo) => {
    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);

  });


  
  server.on('listening', () => {
    const address = server.address();
    console.log(address)
  });
  
server.bind(7070)
client.bind(6060)
  


