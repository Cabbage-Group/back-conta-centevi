const io = require('socket.io-client');

// Conectarse al servidor WebSocket en el puerto 3008
const socket = io('ws://localhost:3002');

socket.on('connect', () => {
    console.log('✅ Conectado al servidor WebSocket');
    socket.emit('createChat', { sender: 'User1', content: 'Hola desde el cliente' });
});

socket.on('disconnect', () => {
    console.log('❌ Desconectado del servidor');
});

socket.on('connect_error', (err) => {
    console.error('🚨 Error de conexión:', err);
});

// Escuchar mensajes del servidor
socket.on('message', (msg) => {
    console.log('📩 Mensaje recibido:', msg);
});
