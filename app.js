var express = require("express");
var app = express();
var server = require("http").Server(app);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/client/index.html")
});
app.use("/client", express.static(__dirname + "/client"));
server.listen(2000);
console.log("Server started!");

var socketList = {};
var playerList = {};

var Player = function (id) {
  var self = {
    x:250,
    y:250,
    id:id,
    czyD:false,
    czyA:false,
    czyW:false,
    czyS:false,
    speed:5
  };
  self.updatePos = function () {
    if(self.czyD)self.x+= self.speed;
    if(self.czyA)self.x-= self.speed;
    if(self.czyS)self.y+= self.speed;
    if(self.czyW)self.y-= self.speed;
  };
  return self;
};

var io = require("socket.io")(server, {});
io.sockets.on("connection", function (socket) {
  socket.id = Math.random();
  socketList[socket.id] = socket;

  var player = Player(socket.id);
  playerList[socket.id] = player;

  console.log("socket connection");

  socket.on("disconnect", function () {
    delete socketList[socket.id];
    delete playerList[socket.id];
  });

  socket.on("keyPress", function (data) {
    if(data.key == "d") player.czyD = data.state;
    else if(data.key == "a") player.czyA = data.state;
    else if(data.key == "s") player.czyS = data.state;
    else if(data.key == "w") player.czyW = data.state;
  })
});

setInterval(function () {
  var pack = [];
  for(var i in playerList){
    var player = playerList[i];
    player.updatePos();
    pack.push({x:player.x, y:player.y});
  }
  for(var i in socketList){
    var socket = socketList[i];
    socket.emit("newPos", pack);
  }
}, 1000/30);
