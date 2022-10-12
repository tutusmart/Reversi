/*
 * @Author: tuWei
 * @Date: 2022-10-11 18:18:18
 * @LastEditors: tuWei
 * @LastEditTime: 2022-10-13 00:06:00
 */
const http = require('http');

const WebSocketServer = require('ws').Server,
wss = new WebSocketServer({port: 9009});
const port = process.env.PORT || 3000;

const matchmaking = {};

/**
 * 返回值str参数说明
 * */
// let str = {
//   code: ’‘, 1表示建立连接，code表示落子， 3表示对局结束
//   gameColor: client.gameColor, 表示当前client所属颜色
//   msg: '正在等待对局连接...', 提示语
//   colorType: client.colorType, 当前落子颜色
//   doublePs: client.doublePs, 对局密码配置
// }

wss.on('connection', function(ws) {
    ws.on('message', function(message) {
      let mp = JSON.parse(message);
      if(mp.code === 1 && !matchmaking.hasOwnProperty(mp.doublePs)){
        ws.doublePs = mp.doublePs;
        ws.gameColor = mp.gameColor;
        ws.colorType = mp.colorType;
        matchmaking[mp.doublePs] = [mp];
        let str = {
          code: 0,
          gameColor: mp.gameColor,
          msg: '正在等待对局连接...',
          colorType: mp.colorType,
          doublePs: mp.doublePs,
        }
        console.log('str1 ' + JSON.stringify(str));
        ws.send(JSON.stringify(str));
        return
      }
      if(mp.code === 1 && matchmaking.hasOwnProperty(mp.doublePs)) {
        ws.doublePs = mp.doublePs;
        if(ws.colorType === undefined){
          ws.colorType = ws.colorType ? 0 : 1;
        }
        if(ws.gameColor === undefined ){
          ws.gameColor = ws.gameColor ? 0 : 1;
        }
        let str = {
          code: 1,
          msg: '对局开始...',
          doublePs: ws.doublePs,
          colorType: ws.colorType,
          gameColor: ws.gameColor,
        }
        ws.send(JSON.stringify(str));
        wss.clients.forEach(function each(client) {
          if(client.doublePs === mp.doublePs){
            str.colorType = client.colorType;
            str.gameColor = client.gameColor;
            client.send(JSON.stringify(str));
          }
        })
      }
      if(mp.code === 2){
        let str = { 
          code: 2, 
          msg: '落子',  
          x: mp.x,
          y: mp.y,
          colorType: ws.colorType,
          gameColor: ws.gameColor,
        }
        ws.send(JSON.stringify(str));
        wss.clients.forEach(function each(client) {
          console.log(client.colorType,client.gameColor,client.doublePs, ws.doublePs);
          if(client.doublePs === ws.doublePs){
            str.colorType = client.colorType;
            str.gameColor = client.gameColor;
            client.send(JSON.stringify(str));
          }
        })
      }
      if(mp.code === 3){
        let str = { 
          code: 2, 
          msg: mp.msg,  
        }
        ws.send(JSON.stringify(str));
        wss.clients.forEach(function each(client) {
          console.log(client.colorType,client.gameColor,client.doublePs, ws.doublePs);
          if(client.doublePs === ws.doublePs){
            client.send(JSON.stringify(str));
          }
        })
      }
      wss.on('close', function close(client) {
        console.log('close', client);
        clearInterval(interval);
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