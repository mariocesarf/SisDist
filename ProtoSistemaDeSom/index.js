import dgram from 'dgram'
import net from 'net'
import protobuf from "protobufjs"
import chalk from 'chalk'
const PORT = 6024
let connected = false;
const MCAST_ADDR = "224.0.0.0";



const CONNECTION_COMMAND = "$CONECTAR"
const TYPE = "Atuador"
const NAME = "Sistema de som"

let VOLUME = 0;
let ACTUAL_TRACK = ''


const udpClient =  dgram.createSocket({ type: 'udp4', reuseAddr: true })
udpClient.bind(6024, function () {
  udpClient.setBroadcast(true);
  udpClient.setMulticastTTL(1);
  udpClient.addMembership(MCAST_ADDR);
})

const tcpClient = new net.Socket()

const RequestRepository = await protobuf.load("Dispositive.proto")

let BroadcastMessageRequestHandler = RequestRepository.lookupType("DispositivePackage.BroadcastMessage");
let IdentifierMessageRequestHandler = RequestRepository.lookupType("DispositivePackage.IdentifierMessage");
let PatternIdentifierMessageRequestHandler = RequestRepository.lookupType("DispositivePackage.PatternIdentifierMessage");

let FeedbackMessageFactory = RequestRepository.lookupType("DispositivePackage.FeedbackMessage");
let EditSoundSystemMessageFactory = RequestRepository.lookupType('DispositivePackage.EditSoundSystemMessage');

let IdentifierMessageRequest = IdentifierMessageRequestHandler.create({
  Description: 'IdentifierMessage',
  Name: NAME,
  SensorType: TYPE
})

let IdentifierMessage = IdentifierMessageRequestHandler.encode(IdentifierMessageRequest).finish()


udpClient.on('listening', () => {
  console.log('Sistema de som iniciado!');

})


udpClient.on('message', (msg, rinfo) => {
    let { Command } = BroadcastMessageRequestHandler.decode(msg)
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

  var { Description } = PatternIdentifierMessageRequestHandler.decode(data);

  switch (Description) {
      case 'EditSoundSystemMessage':

        var { ActualTrack, Volume } = EditSoundSystemMessageFactory.decode(data);
        ACTUAL_TRACK = ActualTrack || '';
        VOLUME = Volume || 0;
        console.log(chalk.green(`A musica atual é ${ACTUAL_TRACK} com volume ${VOLUME}`))

        let FeedbackMessageRequest = FeedbackMessageFactory.create({
          Description: 'FeedbackMessage',
          ActualTrack: ACTUAL_TRACK,
          Volume: VOLUME
            });
      
        let FeedbackMessage = FeedbackMessageFactory.encode(FeedbackMessageRequest).finish();

        tcpClient.write(FeedbackMessage)
        
        
        
        break;
  }





})


