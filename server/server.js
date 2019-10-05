const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const http = require('http');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const message = (name, text) => ({name, text});

app.use(express.static(publicPath));

io.on('connection', socket => {
  socket.on('message:create', (data, callback) => {
    if (!data) {
      callback(`Message can't br empty`);
    } else {
      callback();
      io.emit('message:new', message('Admin', data.text));
    }

    // console.log('Socket:createMessage ', data);
    // socket.emit('newMassage', {
    //   text: data.value,
    //   date: new Date()
    // });
  });

});

server.listen(port, ()=> {
  console.log(`Server has been started on port ${port} ...`);
});
