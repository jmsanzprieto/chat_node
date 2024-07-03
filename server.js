// Importamos las dependencias necesarias para el servidor
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Creamos una instancia de la aplicación Express
const app = express();
// Creamos un servidor HTTP y lo asociamos con la aplicación Express
const server = http.createServer(app);
// Creamos una instancia de Socket.io y la asociamos con el servidor HTTP
const io = socketIo(server);
// Definimos el puerto en el que el servidor escuchará (por defecto es 3000 pero podemos poner el que sea necesario)
const PORT = process.env.PORT || 3000;

// Servimos archivos estáticos desde el directorio 'public'
app.use(express.static(__dirname + '/public'));

// Objeto para almacenar los usuarios conectados
let users = {};

// Evento de conexión de Socket.io, se ejecuta cuando un usuario se conecta
io.on('connection', (socket) => {
    console.log('Usuario conectado');

    // Evento para establecer el nombre de usuario
    socket.on('set username', (username) => {
        // Guardamos el nombre de usuario asociado con el ID del socket
        users[socket.id] = username;
        // Enviamos la lista actualizada de usuarios a todos los clientes conectados
        io.emit('update users', Object.values(users));
        console.log('Usuarios conectados: ', users);
    });

    // Evento para manejar mensajes de chat públicos
    socket.on('chat message', (data) => {
        const { name, msg } = data;
        console.log(`Mensaje recibido de ${name}: ${msg}`);
        // Enviamos el mensaje de chat a todos los clientes conectados
        io.emit('chat message', `${name} ha dicho: ${msg}`);
    });

    // Evento para manejar mensajes privados
    socket.on('private message', (data) => {
        const { to, from, msg } = data;
        // Buscamos el ID del socket del usuario destinatario
        const targetSocketId = Object.keys(users).find(id => users[id] === to);
        if (targetSocketId) {
            // Enviamos el mensaje privado al socket del destinatario
            io.to(targetSocketId).emit('private message', { from, msg });
        }
    });

    // Evento de desconexión de Socket.io, se ejecuta cuando un usuario se desconecta
    socket.on('disconnect', () => {
        // Eliminamos el usuario desconectado de la lista de usuarios
        delete users[socket.id];
        // Enviamos la lista actualizada de usuarios a todos los clientes conectados
        io.emit('update users', Object.values(users));
        console.log('Usuario desconectado');
    });
});


// Ponemos el servidor a escuchar en el puerto definido
server.listen(PORT, () => {
    console.log(`Servidor de chat escuchando en http://localhost:${PORT}`);
});
