// CLIENTE

// Importações
let net = require("net");
let chalk = require("chalk");
let readline = require("readline");

// Configurações
let connectionParams = {
  ip: "",
  port: "",
  nickname: "",
};

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let nicknameChange = false;

let client = new net.Socket();

// Eventos
terminal.question(
  chalk.magenta(
    "Qual comando deseja executar?: \n/ENTRAR\n/USUARIOS\n/NICK\n/SAIR\n"
  ),
  (cmd) => {
    switch (cmd) {
      case "/ENTRAR":
        terminal.question(chalk.yellow("Insira o IP desejado:\n"), (ip) => {
          connectionParams.ip = ip;
          terminal.question(
            chalk.yellow("Insira a porta desejada:\n"),
            (port) => {
              connectionParams.port = port;
              terminal.question(
                chalk.yellow("Insira o none de usuario desejado:\n"),
                (nickname) => {
                  connectionParams.nickname = nickname;
                  client.connect({
                    ip: connectionParams.ip,
                    port: 2222,
                  });
                }
              );
            }
          );
        });
        break;

      case "/SAIR":
        client.destroy();
        break;
    }
  }
);

client.on("connect", () => {
  console.log(chalk.green("Cliente: Tentativa de conexão com o servidor"));
  client.write(JSON.stringify({ nome: connectionParams.nickname }));
});

client.on("ready", () => {
  terminal.on("line", (input) => {
    if (nicknameChange) {
      client.write(
        JSON.stringify({
          owner: connectionParams.nickname,
          newNickname: input,
        })
      );
      nicknameChange = false;
    } else {
      client.write(
        JSON.stringify({
          owner: connectionParams.nickname,
          message: input,
        })
      );
    }
  });
});

client.on("data", (data) => {
  let messageData = JSON.parse(data.toString());

  if (messageData.nome != undefined && messageData.message != undefined) {
    console.log(
      chalk
        .magenta(messageData.nome)
        .concat(":\t")
        .concat(chalk.white(messageData.message))
    );
  }
  if (messageData.error != undefined) {
    console.log(chalk.red(messageData.error));
  }

  if (messageData.serverMessage != undefined) {
    console.log(chalk.yellow(messageData.serverMessage));

    if (messageData.serverMessage == "Insira seu novo nome") {
      nicknameChange = true;
    }
  }
  if (messageData.newName != undefined) {
    connectionParams.nickname = messageData.newName;
  }

  if (Array.isArray(messageData)) {
    console.log(chalk.yellow("Lista de usuarios: \n"));
    messageData.forEach((user) => {
      console.log(chalk.yellow(user.concat("\n")));
    });
  }
});

client.on("close", () => {
  console.log(chalk.red("Cliente desconectado"));
});

client.on("error", (err) => {
  console.log(chalk.red(err));
});
