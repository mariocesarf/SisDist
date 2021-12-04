import dgram from 'dgram'
import net from 'net'
import protobuf from "protobufjs"

const PORT = 6024
let connected = false;
const MCAST_ADDR = "224.0.0.0";

const CONNECTION_COMMAND = "$CONECTAR"
const TYPE = "Sensor"
const NAME = "Sensor de temperatura"

const udpClient =  dgram.createSocket({ type: 'udp4', reuseAddr: true })
const tcpClient = new net.Socket()

const RequestRepository = await protobuf.load("Sensor.proto")

let BroadcastMessageRequestHandler = RequestRepository.lookupType("SensorPackage.BroadcastMessage");
let IdentifierMessageRequestHandler = RequestRepository.lookupType("SensorPackage.IdentifierMessage");
let SensorMessageRequestHandler = RequestRepository.lookupType("SensorPackage.SensorMessage")

const SendSensorData = () => {
  let TEMPERATURE = 25 + Math.random();
  let HUMIDITY = Math.random()*100;
  let PRESSURE = 1 + Math.random();

  let SensorMessageRequest = SensorMessageRequestHandler.create({
    Description: 'SensorMessage',
    Temperature: TEMPERATURE.toString(),
    Humidity: HUMIDITY.toString(),
    Pressure: PRESSURE.toString(),
      });

  console.log(SensorMessageRequest)
  let SensorMessage = SensorMessageRequestHandler.encode(SensorMessageRequest).finish();
  if(connected) tcpClient.write(SensorMessage)
}

let IdentifierMessageRequest = IdentifierMessageRequestHandler.create({
  Description: 'IdentifierMessage',
  Name: NAME,
  SensorType: TYPE
})

let IdentifierMessage = IdentifierMessageRequestHandler.encode(IdentifierMessageRequest).finish()

udpClient.bind(6024, function () {
  udpClient.setBroadcast(true);
  udpClient.setMulticastTTL(1);
  udpClient.addMembership(MCAST_ADDR);
})


udpClient.on('listening', () => {
  console.log('Sensor de temperatura iniciado!');
 
})

setInterval(SendSensorData, 10000)
udpClient.on('message', (msg, rinfo) => {
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
  // console.log(data.toString() + 'oi teste');
})

