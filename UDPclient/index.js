// CLIENTE

// Importações
import readline from "readline";
import chalk from "chalk";
import dgram from "dgram";
import { Buffer } from "buffer";

// Configurações
const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const client = dgram.createSocket("udp4");

// Eventos
terminal.on("line", (op) => {
  console.log(chalk.yellow("Operação:\t".concat(op)));
  const message = Buffer.from(op);
  client.send(message, 6060, "0.0.0.0", (err) => {});
});

client.on("message", (msg) => {
  console.log(chalk.green("Resultado:\t".concat(msg.toString())));
});

client.on("listening", () => {
  const address = client.address();
});
