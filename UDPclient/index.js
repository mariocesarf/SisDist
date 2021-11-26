// CLIENTE
import readline from 'readline'
import chalk from "chalk"


const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

import dgram from 'dgram';
import { Buffer } from 'buffer';

const client = dgram.createSocket('udp4');


terminal.on('line', (op) => {

  console.log(chalk.yellow('Operação:\t'.concat(op)))
  const message = Buffer.from(op)
  
  client.send(message, 6060, '0.0.0.0', (err) => {
  });


})

client.on('message', (msg) => {
  console.log(chalk.green("Resultado:\t".concat(msg.toString())))
} )

client.on("listening", () => {
  const address = client.address();
});


  


