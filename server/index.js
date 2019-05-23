const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cors = require('cors');

const signalServer = require('simple-signal-server')(io)
const allIDs = new Set()

app.use(cors());

app.get("/roomID", (req, res) => {
  const roomID = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);

  return res.json({ roomID });
})

signalServer.on('discover', (request) => {
  const clientID = request.socket.id // you can use any kind of identity, here we use socket.id
  allIDs.add(clientID) // keep track of all connected peers
  request.discover(clientID, Array.from(allIDs)) // respond with id and list of other peers
  console.log(allIDs);
})

signalServer.on('disconnect', (socket) => {
  const clientID = socket.id
  allIDs.delete(clientID)
})

signalServer.on('request', (request) => {
  request.forward()
})

server.listen(8080);

// io.on('connection', function (socket) {
//     socket.on('join', function (data) {
//         socket.join(data.roomID);
//         socket.room = data.roomID;
//         const sockets = io.of('/').in().adapter.rooms[data.roomID];

//         if (sockets.length > 1) {
//           io.of('/')
//             .in(data.roomID)
//             .clients((err, clients) =>
//               socket.broadcast.to(clients[0]).emit('newPlayer', data.name)
//             );
//         }
//     });

//     socket.on('signal', (data) => {
//         io.to(data.room).emit('desc', data.desc)        
//     })
    
//     socket.on('disconnect', () => {
//         const roomId = Object.keys(socket.adapter.rooms)[0]
//         if (socket.room){
//             io.to(socket.room).emit('disconnected')
//         }
        
//     })
// });