/*
 * @Author: tuWei
 * @Date: 2022-10-11 18:18:18
 * @LastEditors: tuWei
 * @LastEditTime: 2022-10-12 00:42:18
 */
const http = require('http');

const WebSocketServer = require('ws').Server,
wss = new WebSocketServer({port: 9009});
const port = process.env.PORT || 3000;

const Matchmaking = {};

wss.on('connection', function(ws) {
    ws.on('message', function(message) {
      let mp = JSON.parse(message);
      wss.clients.forEach(function each(client) {
        if (client.readyState === ws.OPEN) {
          if(Matchmaking.hasOwnProperty(mp.doublePs)) {
            console.log( 'gameId' + mp.gameId );
            if(mp.gameId){
              Matchmaking[mp.doublePs] = mp;
            }else{
              mp.gameId = Matchmaking[mp.doublePs].gameId || new Date().getTime();
              if(Matchmaking[mp.doublePs]){
                mp = Matchmaking[mp.doublePs];
              }
            }
            client.send(JSON.stringify(mp));
          }else{
            Matchmaking[mp.doublePs] = mp;
            client.send(JSON.stringify({ msg: '等待开局...' }));
          }
        }
      });
    });
});

const server = http.createServer((req, res) => {
  res.writeHead(200, {"Content-Type": 'text/plain'})
  res.end('Hello World!');
});

server.listen(port, () => {
  console.log('Server listening on: http://localhost:%s', port);
})