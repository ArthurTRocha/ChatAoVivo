// Importa as bibliotecas necessárias
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

// Cria uma instância do aplicativo Express
const app = express();

// Cria um servidor HTTP usando o aplicativo Express
const server = http.createServer(app);

// Cria uma instância do Socket.IO associada ao servidor
const io = socketIO(server, {
  cors: {
    origin: ['http://localhost:5173'], // Permite conexões somente a partir deste endereço
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Armazena informações sobre os usuários e suas salas
const users = {};
const adminSocketId = 'admin'; // Identificador fixo para o admin
let previousChats = []; // Armazena os chats anteriores

// Configura um evento de conexão quando um cliente se conecta ao servidor
io.on('connection', (socket) => {
  console.log(`Novo cliente conectado: ${socket.id}`);

  // Cria uma sala única para o cliente e o admin
  const userRoom = `room_${socket.id}`;
  socket.join(userRoom);

  // Configura um evento para receber o nome do usuário do cliente
  socket.on('nomeUsuario', (name) => {
    // Atualiza o nome do usuário associado ao socket
    console.log(`Nome recebido do cliente ${socket.id}:`, name);

    users[socket.id] = { name, sala: userRoom };

    // Atualiza os chats disponíveis para o admin
    if (socket.id !== adminSocketId) {
      updateChats();
    }
  });

  // Configura um evento para receber mensagens do cliente
socket.on('mensagem', (data) => {
  const { mensagem } = data;
  console.log(`Mensagem recebida de ${socket.id}:`, mensagem);

  // Verifica se o remetente é o admin
  const isFromAdmin = socket.id === adminSocketId;

  // Adiciona a mensagem à sala do cliente apenas se for do admin
  if (isFromAdmin) {
    const messageToClient = { remetente: adminSocketId, mensagem };
    io.to(userRoom).emit('resposta', messageToClient);
  }

  // Adiciona a mensagem à sala do admin apenas se não for do admin
  if (!isFromAdmin) {
    const messageToAdmin = { remetente: socket.id, mensagem };
    io.to(adminSocketId).emit('resposta', messageToAdmin);
  }
});


  // Configura um evento para quando o cliente desconectar
  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
    // Remove o usuário quando ele desconectar
    delete users[socket.id];

    // Atualiza os chats disponíveis para o admin
    if (socket.id !== adminSocketId) {
      updateChats();
    }
  });

  // Configura um evento para permitir que o admin entre em uma sala específica
  socket.on('entrarComoAdmin', () => {
    socket.join(adminSocketId);
    // Atualiza os chats disponíveis para o admin quando o admin entra
    updateChats();
  });
});

// Função para atualizar os chats disponíveis para o admin
function updateChats() {
  const currentChats = Object.keys(users).map((userId) => ({ 
    sala: userId, 
    messages: [],
    name: users[userId].name, // Adiciona o nome do cliente
  }));

  // Verifica se houve uma alteração nas salas antes de enviar ao admin
  if (!areChatsEqual(currentChats, previousChats)) {
    io.to(adminSocketId).emit('chats', currentChats);
    previousChats = currentChats; // Atualiza os chats anteriores
  }
}

// Função para verificar se os chats são iguais
function areChatsEqual(chats1, chats2) {
  return JSON.stringify(chats1) === JSON.stringify(chats2);
}

// Define a porta do servidor, utilizando a porta padrão 3001 se não houver uma porta definida nas variáveis de ambiente
const PORT = process.env.PORT || 3001;

// O servidor escuta a porta especificada
server.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta ${PORT}`);
});
