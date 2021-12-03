import dgram from 'dgram'
import net from 'net'
import protobuf from "protobufjs"

const PORT = 6024
let connected = false;
const MCAST_ADDR = "224.0.0.0";



const CONNECTION_COMMAND = "$CONECTAR"
const TYPE = "Atuador"
const NAME = "Sistema de som"

let VOLUME = 0;
let ACTUAL_TRACK = ''


const udpClient = dgram.createSocket('udp4');
const tcpClient = new net.Socket()

const RequestRepository = await protobuf.load("Dispositive.proto")

let BroadcastMessageRequestHandler = RequestRepository.lookupType("DispositivePackage.BroadcastMessage");
let IdentifierMessageRequestHandler = RequestRepository.lookupType("DispositivePackage.IdentifierMessage");

let FeedbackMessageFactory = RequestRepository.lookupType("DispositivePackage.FeedbackMessage");
let EditSoundSystemMessageFactory = RequestRepository.lookupType('DispositivePackage.EditSoundSystemMessage');


let IdentifierMessageRequest = IdentifierMessageRequestHandler.create({
  Description: 'IdentifierMessage',
  Name: NAME,
  SensorType: TYPE
})

let IdentifierMessage = IdentifierMessageRequestHandler.encode(IdentifierMessageRequest).finish()

udpClient.bind(6023, function () {
  console.log('cone')
  udpClient.setBroadcast(true);
  udpClient.setMulticastTTL(1);
  udpClient.addMembership(MCAST_ADDR);
})

udpClient.on('listening', () => {
  console.log('Sistema de som iniciado!');

})


udpClient.on('message', (msg, rinfo) => {
  console.log(msg)
    let { Command } = BroadcastMessageRequestHandler.decode(msg)
    
    console.log(Command)
    if(CONNECTION_COMMAND.includes(Command) && !connected)
    {
      console.log(rinfo.address)
      console.log(rinfo.port)

      tcpClient.connect({
        ip: rinfo.adress,
        port: 8080
      })
    }
})

tcpClient.on('connect', () => {
  connected = true;
 tcpClient.write(IdentifierMessage)
})

tcpClient.on("data", (data) => {
})

