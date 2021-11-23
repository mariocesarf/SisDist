// SERVIDOR 
import dgram from 'dgram';
import { Server }  from 'http'
import { Buffer } from 'buffer';
import { descerializer, calcular } from "./RequestHandler.js"

const server = dgram.createSocket('udp4');

server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
});


server.on('message', (msg, rinfo) => {
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  const operationResult = calcular(descerializer(msg.toString()));
  const bufferedMessage = Buffer.from(operationResult.toString())


  server.send(bufferedMessage, 7070, '0.0.0.0', (err) => {
      if(err){
        server.close();
      }else{
          console.log(operationResult)
        console.log(`Enviado para: ${rinfo.address} : ${rinfo.port} `);
      }
  })  

  
});

server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});



server.bind(8080)

 
