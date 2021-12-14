// SERVIDOR

// Importações
import net from "net";
import chalk from "chalk";
import { storage } from "./RequestHandler.js";

// Configurações
const USER_LIMITS = 4;

let server = net.createServer((socket) => {
  socket.pipe(socket);
});

// Eventos
server.on("close", () => {
  console.log("Servidor fechado!");
});

server.on("exit", () => {});

server.on("error", (err) => {
  console.log(err);
});

server.on("connection", (socket) => {
  let db = storage.buscarRepositorio();
  console.log(storage.buscarNumeroUsuarios());

  if (storage.buscarNumeroUsuarios() >= USER_LIMITS) {
    socket.write(JSON.stringify({ error: "Limite de usuarios atingido!" }));
    socket.end();
  }

  socket.on("close", (err) => {
    let clientName = storage.buscarNome(socket);
    console.log(clientName);
    storage.deleteClient(clientName);
  });

  socket.on("data", (data) => {
    console.log(chalk.yellow(data.toString()));
    let req = JSON.parse(data.toString());

    let name = req.nome;
    let msg = req.message;
    let msgOwner = req.owner;

    let isUserRegistered = storage.verificar(name);
    if (isUserRegistered) {
      socket.write(
        JSON.stringify({ error: "Ja existe um usuario com esse nome!" })
      );
      socket.end();
    }

    switch (msg) {
      case "/USUARIOS":
        socket.write(storage.listarUsuarios());
        break;

      case "/NICK":
        socket.write(JSON.stringify({ serverMessage: "Insira seu novo nome" }));
        break;

      case "/SAIR":
        socket.write(
          JSON.stringify({ serverMessage: "Usuario desconectado com sucesso" })
        );
        socket.end();
        storage.deleteClient(msgOwner);
        storage.broadcast("Usuario\t" + msgOwner + "\tfoi desconectado! ");
        break;

      default:
        if (name && !isUserRegistered) {
          storage.newClient(name, socket);
          storage.broadcast("Usuario\t" + name + "\tentrou do chat!");
        }

        if (req.newNickname) {
          let newSocket = storage.buscarSocket(msgOwner);
          if (!storage.verificar(req.newNickname)) {
            newSocket.write(JSON.stringify({ newName: req.newNickname }));
            storage.alterarNick(msgOwner, req.newNickname);
            storage.broadcast(
              "O usuario\t" +
                msgOwner +
                "\t alterou o nickname para\t" +
                req.newNickname
            );
          } else {
            newSocket.write(
              JSON.stringify({
                error: "Ja existe um usuario com esse nickname!",
              })
            );
          }
        }

        if (msg)
          db.forEach((sock) => {
            if (msg) {
              sock.write(
                JSON.stringify({
                  nome: msgOwner || "",
                  message: msg,
                })
              );
            }
          });
        break;
    }
  });

  server.getConnections((error, count) => {
    console.log("Number of concurrent connections to the server : " + count);
  });
});

server.listen(2222);
