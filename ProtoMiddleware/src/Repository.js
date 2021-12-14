export const storage = {
  database: new Map(),

  newService(service, socket) {
    let { Name, Type } = service;
    if (!this.verificar(Name)) {
      this.database.set(Name, {
        Socket: socket,
        Type: Type,
      });
      return true;
    }
    return false;
  },

  listarDispositivos() {
    return JSON.stringify(Array.from(this.database.keys()));
  },

  verificar(service) {
    let { Name, Type } = service;
    return this.database.has(Name);
  },

  buscarDispositivo(Name) {
    return this.database.get(Name);
  },

  buscarNome(socket) {
    this.database.forEach((sock, name) => {
      if (sock == socket) {
        return name;
      }
    });
    return "";
  },

  buscarRepositorio() {
    return this.database;
  },
};
