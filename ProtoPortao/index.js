import dgram from "dgram";
import net from "net";
import protobuf from "protobufjs";
import chalk from "chalk";
const PORT = 6024;
let connected = false;
const MCAST_ADDR = "224.0.0.0";

const CONNECTION_COMMAND = "$CONECTAR";
const TYPE = "Atuador";
const NAME = "Portão";

let STATUS = "FECHADO";

const udpClient = dgram.createSocket({ type: "udp4", reuseAddr: true });
udpClient.bind(6024, function () {
  udpClient.setBroadcast(true);
  udpClient.setMulticastTTL(1);
  udpClient.addMembership(MCAST_ADDR);
});

const tcpClient = new net.Socket();

const RequestRepository = await protobuf.load("Dispositive.proto");

let BroadcastMessageRequestHandler = RequestRepository.lookupType(
  "DispositivePackage.BroadcastMessage"
);
let IdentifierMessageRequestHandler = RequestRepository.lookupType(
  "DispositivePackage.IdentifierMessage"
);
let PatternIdentifierMessageRequestHandler = RequestRepository.lookupType(
  "DispositivePackage.PatternIdentifierMessage"
);

let GateStatusMessageFactory = RequestRepository.lookupType(
  "DispositivePackage.GateStatusMessage"
);
let EditGateStatusMessageFactory = RequestRepository.lookupType(
  "DispositivePackage.EditGateStatusMessage"
);

let IdentifierMessageRequest = IdentifierMessageRequestHandler.create({
  Description: "IdentifierMessage",
  Name: NAME,
  SensorType: TYPE,
});

let IdentifierMessage = IdentifierMessageRequestHandler.encode(
  IdentifierMessageRequest
).finish();

udpClient.on("listening", () => {
  console.log("Portão conectado!");
});

udpClient.on("message", (msg, rinfo) => {
  let { Command } = BroadcastMessageRequestHandler.decode(msg);
  if (CONNECTION_COMMAND.includes(Command) && !connected) {
    tcpClient.connect({
      ip: rinfo.adress,
      port: 8080,
    });
  }
});

tcpClient.on("connect", () => {
  connected = true;
  tcpClient.write(IdentifierMessage);
});

tcpClient.on("data", (data) => {
  var { Description } = PatternIdentifierMessageRequestHandler.decode(data);

  switch (Description) {
    case "EditGateStatusMessage":
      var { Status } = EditGateStatusMessageFactory.decode(data);

      if (Status == "/ABRIR" || "/FECHAR") {
        switch (Status) {
          case "/ABRIR":
            STATUS = "ABERTO";
            break;
          case "/FECHAR":
            STATUS = "FECHADO";
            break;
        }
      }

      console.log(chalk.green(`O portão agora está ${STATUS}`));

      let GateStatusMessageRequest = GateStatusMessageFactory.create({
        Description: "GateStatusMessage",
        Status: STATUS,
      });

      let GateStatusMessage = GateStatusMessageFactory.encode(
        GateStatusMessageRequest
      ).finish();

      tcpClient.write(GateStatusMessage);

      break;
  }
});
