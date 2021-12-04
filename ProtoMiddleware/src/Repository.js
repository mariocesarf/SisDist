/*
let cliente = {
    id: IP,
    port: port,
    nick: fornecido por ele na conexão,
}

{ Name : Socket

    ListarDispositivos
    ListarSockets
    VerificarDispositivo
    Broadacast
    GetSocketByName

    {
        Name: Sensor De Temperatura
        Type: 'Sensor'
    }

    enum Description
    SensorMessage
    IdentifierMessage 
    ActuatorMessage
    FeedbackMessage

*/

export const storage = {   
    database: new Map(),
    
    newService(service, socket){
        let {Name, Type} = service
        if(!this.verificar(Name)){
            this.database.set(Name,{
                Socket: socket,
                Type: Type
            });
            return true;
        }
        return false;
    },

    listarDispositivos(){
        return JSON.stringify(Array.from(this.database.keys()))
    },

    // desligarDispositivo(nome){
    //     const socket = this.buscarSocket(nome)
    //     socket.write("Se desliga");
    // },

    verificar(service) {
        let {Name, Type} = service
        return this.database.has(Name)
    },

    buscarDispositivo(Name){
        return this.database.get(Name)
    },

    // broadcast(message){
    //     this.database.forEach(socket => {
    //         socket.write(JSON.stringify({serverMessage: message}))
    //     })
    // },

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
}