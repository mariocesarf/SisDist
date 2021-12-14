import net from "net";
import chalk from "chalk";
import dgram from "dgram";
import protobuf from "protobufjs";
import readline from "readline";

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

import { storage } from "./Repository.js";

var SRC_PORT = 6025;

const PORT = 6024;
const MCAST_ADDR = "224.0.0.0";
const CONNECTION_COMMAND = "$CONECTAR";

const RequestRepository = await protobuf.load("Middleware.proto");

let BroadcastMessageRequestHandler = RequestRepository.lookupType(
  "MiddlewarePackage.BroadcastMessage"
);
let IdentifierMessageRequestHandler = RequestRepository.lookupType(
  "MiddlewarePackage.IdentifierMessage"
);
let SensorMessageRequestHandler = RequestRepository.lookupType(
  "MiddlewarePackage.SensorMessage"
);
let PatternIdentifierMessageRequestHandler = RequestRepository.lookupType(
  "MiddlewarePackage.PatternIdentifierMessage"
);

let FeedbackMessageFactory = RequestRepository.lookupType(
  "MiddlewarePackage.FeedbackMessage"
);
let EditSoundSystemMessageFactory = RequestRepository.lookupType(
  "MiddlewarePackage.EditSoundSystemMessage"
);

let GateStatusMessageFactory = RequestRepository.lookupType(
  "MiddlewarePackage.GateStatusMessage"
);
let EditGateStatusMessageFactory = RequestRepository.lookupType(
  "MiddlewarePackage.EditGateStatusMessage"
);

let BroadcastMessageRequest = BroadcastMessageRequestHandler.create({
  Command: CONNECTION_COMMAND,
});

let udpServer = dgram.createSocket({ type: "udp4", reuseAddr: true });

udpServer.bind(SRC_PORT, function () {
  udpServer.setBroadcast(true);
});

let tcpServer = net.createServer((socket) => {
  socket.on("data", () => {});

  socket.pipe(socket);
});

tcpServer.on("listening", () => {
  console.log(chalk.green("Middleware iniciado"));
});

tcpServer.on("connection", (socket) => {
  console.log(socket.localAddress);
  socket.on("data", (data) => {
    // console.log(SensorMessageRequestHandler.decode(data))
    let { Description } = PatternIdentifierMessageRequestHandler.decode(data);
    switch (Description) {
      case "SensorMessage":
        let { Temperature, Pressure, Humidity, Description } =
          SensorMessageRequestHandler.decode(data);
        //console.log(chalk.yellow(Temperature, Pressure, Humidity))

        console.log(
          chalk.yellow(
            `Relatorio do Sensor de Temperatura:\n A temperatura atual é de  ${Temperature} C\n A umidade do ar atualmente é de ${Humidity} %\n A pressão atmosferica é de ${Pressure} atm\n`
          )
        );

        break;
      case "IdentifierMessage":
        let { Name, SensorType } = IdentifierMessageRequestHandler.decode(data);
        storage.newService({ Name, SensorType }, socket);
        console.log(
          chalk.green(
            `Dispositivo de nome: ${Name} e de tipo: ${SensorType} conectado com sucesso!`
          )
        );
        break;
      case "FeedbackMessage":
        let { ActualTrack, Volume } = FeedbackMessageFactory.decode(data);
        console.log(
          chalk.cyan(
            `A musica ${ActualTrack} começou a tocar com volume ${Volume}`
          )
        );
        break;

      case "GateStatusMessage":
        let { Status } = GateStatusMessageFactory.decode(data);
        console.log(chalk.magenta(`O portão está ${Status}`));
        break;
      default:
        console.log(chalk.red(Description));
        break;
    }
  });
});

tcpServer.on("close", () => {
  console.log(chalk.yellow("Middleware encerrado!"));
});

terminal.on("line", (input) => {
  var splittedInput = input.split(" ");
  var Command = splittedInput[0];

  switch (Command) {
    case "/SOM":
      var newTrack = splittedInput[1];
      var newVolume = splittedInput[2];

      var EditSoundSystemRequest = EditSoundSystemMessageFactory.create({
        Description: "EditSoundSystemMessage",
        ActualTrack: newTrack,
        Volume: newVolume,
      });

      var EditSoundSystemMessage = EditSoundSystemMessageFactory.encode(
        EditSoundSystemRequest
      ).finish();
      var { Socket } = storage.buscarDispositivo("Sistema de som");

      Socket.write(EditSoundSystemMessage);

      break;

    case "/ABRIR":
      var EditGateStatusMessageRequest = EditGateStatusMessageFactory.create({
        Description: "EditGateStatusMessage",
        Status: Command,
      });

      var EditGateStatusMessage = EditGateStatusMessageFactory.encode(
        EditGateStatusMessageRequest
      ).finish();
      var { Socket } = storage.buscarDispositivo("Portão");

      Socket.write(EditGateStatusMessage);

      break;

    case "/FECHAR":
      var EditGateStatusMessageRequest = EditGateStatusMessageFactory.create({
        Description: "EditGateStatusMessage",
        Status: Command,
      });

      var EditGateStatusMessage = EditGateStatusMessageFactory.encode(
        EditGateStatusMessageRequest
      ).finish();
      var { Socket } = storage.buscarDispositivo("Portão");

      Socket.write(EditGateStatusMessage);

      break;
  }
});

setInterval(() => {
  let bufferedBroadcastMessageRequest = BroadcastMessageRequestHandler.encode(
    BroadcastMessageRequest
  ).finish();
  udpServer.send(
    bufferedBroadcastMessageRequest,
    0,
    bufferedBroadcastMessageRequest.length,
    6024,
    MCAST_ADDR
  );
}, 3000);

tcpServer.listen(8080);
