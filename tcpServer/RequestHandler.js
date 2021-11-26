/*
let cliente = {
    id: IP,
    port: port,
    nick: fornecido por ele na conexão,
}
*/

export const storage = {   
    database: new Map(),
    
    newClient(nome, socket){
        if(!this.verificar(nome)){
            this.database.set(nome,socket);
            return true;
        }
        return false;
    },

    listarUsuarios(){
        return JSON.stringify(Array.from(this.database.keys()))
    },
    buscarNumeroUsuarios(){
        return Array.from(this.database.keys()).length
    },

    deleteClient(nome){
        return this.database.delete(nome);
    },

    verificar(nome) {
        return this.database.has(nome);
    },

    buscarSocket(nome){
        return this.database.get(nome)
    },
    broadcast(message){
        this.database.forEach(socket => {
            socket.write(JSON.stringify({serverMessage: message}))
        })

    },

    buscarNome(socket){
        this.database.forEach((sock,name) => {
            if(sock == socket){
                return name
            }
        })
        return ''
    },

    buscarRepositorio(){
        return this.database;        
    },

    alterarNick(nome,novoNome){
        this.database.forEach((value, key, map) => {
            if (key == nome) {
                const aux = value;
                map.delete(key);
                map.set(novoNome, aux);
                return true;    
            };
        })
        return false;
    }
}