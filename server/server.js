const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const http = require('http');

// утилита пользователей
const users = require('./users')();

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const message = (name, text, id) => ({name, text, id});

app.use(express.static(publicPath));

io.on('connection', socket => {
  socket.on('join', (user, callback) => {
    if (!user.name || !user.room) {
      return callback('Enter valid user data');
    }

    callback({userId: socket.id});


    // распределение серверное по комнатам
    socket.join(user.room);

    // удаление пользователя на всякий случай, если такой уже есть
    users.remove(socket.id);

    // добавление пользователя
    users.add(socket.id, user.name, user.room);

    // отправка на фронтент список пользователей
    io.to(user.room).emit('users:update', users.getByRoom(user.room));

    // отправляет сообщение только текущему пользователю (текущему соединению)
    socket.emit('message:new', message('Admin', `Welcom, ${user.name}!`));

    // отправка сообщения всем, кроме текущего пользователя
    socket.broadcast.to(user.room).emit('message:new', message('Admin', `${user.name} joined.`))

    // .to(user.room) указывает в какую комнату отправить сообщение

  });
  socket.on('message:create', (data, callback) => {
    if (!data) {
      callback(`Message can't br empty`);
    } else {
      const user = users.get(socket.id);
      if (user) {
        // отправка сообщения всем пользователям (которые подсоеденены к сокетам)
        io.to(user.room).emit('message:new', message(data.name, data.text, data.id));
      }
      callback();
    }
  });

  // disconnect удаление пользователя, если он вышел из чата
  socket.on('disconnect', () => {
    // user определяем в какой комнате пользователь находился
    const user = users.remove(socket.id);

    // если user вернуло что-то
    if (user) {
      io.to(user.room).emit('message:new', message('Admin', `${user.name}, left.`))

      // обновляем список пользователей если пользователь вышел
      io.to(user.room).emit('users:update', users.getByRoom(user.room));
    }
  });

});

server.listen(port, ()=> {
  console.log(`Server has been started on port ${port} ...`);
});
