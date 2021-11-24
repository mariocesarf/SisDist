// CLIENTE

var net = require('net');
var readline = require('readline')
var chalk = require('chalk')

var connectionParams = {
    ip: '',
    port: '',
    nickname: ''
} 

var client  = new net.Socket();
const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

terminal.question(chalk.magenta('Qual comando deseja executar?: \n/ENTRAR\n/USUARIOS\n/NICK\n/SAIR\n'), (cmd) => {
switch(cmd){
    case '/ENTRAR':
            terminal.question(chalk.yellow('Insira o IP desejado:\n'), (ip) => {
                connectionParams.ip = ip;
                terminal.question(chalk.yellow('Insira a porta desejada:\n'), (port) => {
                    connectionParams.port = port;
                    terminal.question(chalk.yellow('Insira o none de usuario desejado:\n'), (nickname) => {
                        connectionParams.nickname = nickname;
                        console.log(connectionParams)
                        client.connect({
                            ip: connectionParams.ip,
                            port:2222

                        });
                        

                    })

                })
            })
            
            
        break;

    default:
        break;
}


client.on('connect',() => {
    console.log(chalk.green('Cliente: Tentativa de conexão com o servidor'));

    client.write(JSON.stringify({nome: connectionParams.nickname}));
  
  });
})

client.on('data', function(data){console.log(data.toString())})

/*

    client.connect({
        port:2222
    });

    client.on('connect',() => {
        client.write(JSON.stringify({
            name: 'Mario'
        }))
    })



client.on('data',(data) => {
    console.log('Data from server:' + data);
});
*/
