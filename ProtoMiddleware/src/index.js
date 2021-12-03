import net from "net";
import chalk from "chalk"
import dgram from "dgram"
import protobuf from "protobufjs"

import {storage} from "./Repository.js"

var SRC_PORT = 6025;

const PORT = 6024
const MCAST_ADDR = "224.0.0.0";
const CONNECTION_COMMAND = "$CONECTAR"

/*
 - Middleware

 - Sensor de temperatura, humidade e pressão (sensor, envia mensagem a cada n segundos)
 - Motor de portão (atuador)
 - Sistema de som
*/

const RequestRepository = await protobuf.load("Middleware.proto")

let BroadcastMessageRequestHandler = RequestRepository.lookupType("MiddlewarePackage.BroadcastMessage")
let IdentifierMessageRequestHandler = RequestRepository.lookupType("MiddlewarePackage.IdentifierMessage");
let SensorMessageRequestHandler = RequestRepository.lookupType("MiddlewarePackage.SensorMessage");
let PatternIdentifierMessageRequestHandler = RequestRepository.lookupType("MiddlewarePackage.PatternIdentifierMessage");

let BroadcastMessageRequest = BroadcastMessageRequestHandler.create({
    Command: CONNECTION_COMMAND
})

let udpServer = dgram.createSocket("udp4")

udpServer.bind(SRC_PORT, function () {
    udpServer.setBroadcast(true);

});

let tcpServer = net.createServer((socket) => {
    socket.on('data', () => {

    })

    socket.pipe(socket);

})

tcpServer.on('listening', () => {
    console.log(chalk.green('Middleware iniciado'))

})

tcpServer.on('connection', (socket) => {
    console.log(socket.localAddress)
    socket.on('data', (data) => {
       // console.log(SensorMessageRequestHandler.decode(data))
        var { Description } = PatternIdentifierMessageRequestHandler.decode(data)
        switch(Description){
            case 'SensorMessage':
                let {Temperature, Pressure, Humidity, Description } = SensorMessageRequestHandler.decode(data);
                console.log(chalk.yellow(Temperature, Pressure, Humidity))
                break;
            case 'IdentifierMessage':
                let { Name, SensorType } = IdentifierMessageRequestHandler.decode(data);
                console.log(chalk.green(`Dispositivo de nome: ${Name} e de tipo: ${SensorType} conectado com sucesso!`));
                break;
                default:
                    console.log(chalk.red(Description))
                    break;
        }
        
      //  storage.newService({Name, Type}, socket)
        //console.log({Name, Type})
       // console.log({Temperature, Humidity, Pressure})
       // console.log(storage.buscarSocket(Name))
    })
})

tcpServer.on('close', () => {
    console.log(chalk.yellow('Middleware encerrado!'));
})

setInterval(() => {
    console.log('enviado')

        let bufferedBroadcastMessageRequest = BroadcastMessageRequestHandler.encode(BroadcastMessageRequest).finish();
        udpServer.send(bufferedBroadcastMessageRequest, 0, bufferedBroadcastMessageRequest.length, 6024, MCAST_ADDR);

}, 3000)

tcpServer.listen(8080)