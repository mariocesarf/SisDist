/*
let cliente = {
    id: IP,
    port: port,
    nick: fornecido por ele na conexão,
}
*/

export const storage = {   
    database: [],

    setDatabase(database) {
        this.database = database;
    },
    
    newClient(){},

    deleteClient(){},

    verificar(nomeProcurado) {
        let nicks = database.map(clientes => clientes.nick);
        return this.nicks.includes(nomeProcurado)
    },
}