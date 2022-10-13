/*
 * @Author: tuWei
 * @Date: 2022-10-11 18:18:18
 * @LastEditors: tuWei
 * @LastEditTime: 2022-10-13 21:36:52
 */
const http = require('http');

const WebSocketServer = require('ws').Server,
  wss = new WebSocketServer({ port: 9009 });
const port = process.env.PORT || 3000;


//对局缓存对象
const matchmaking = {};
//ws监听方法
wss.on('connection', function (ws) {
  ws.on('message', function (message) {
    let params = JSON.parse(message);
    let str = {
      code: 0, //1表示建立连接，2表示落子， 3表示对局结束
      gameColor: params.gameColor, //对局密码配置
      colorType: params.colorType, //当前落子颜色
      doublePs: params.doublePs, //对局密码配置
    }
    console.log('params: ' + JSON.stringify(params));
    if (params.code === 1) {
      if (!matchmaking.hasOwnProperty(params.doublePs)) {
        str.msg = '正在等待对局连接...';
        ws.doublePs = params.doublePs;
        ws.gameColor = params.gameColor;
        ws.colorType = params.colorType;
        matchmaking[params.doublePs] = [ws];
        ws.send(JSON.stringify(str));
        return
      }
      if (matchmaking.hasOwnProperty(params.doublePs) && matchmaking[params.doublePs].length === 1) {
        ws.doublePs = params.doublePs;
        ws.gameColor = matchmaking[params.doublePs][0].gameColor ? 0 : 1;
        ws.colorType = matchmaking[params.doublePs][0].colorType;
        matchmaking[params.doublePs].push(ws);
        str.msg = '对局开始...';
        str.code = 1;
        wss.clients.forEach(function each(client) {
          if (client.doublePs === params.doublePs) {
            str.colorType = client.colorType;
            str.gameColor = client.gameColor;
            client.send(JSON.stringify(str));
          }
        })
      } else if (matchmaking[params.doublePs].length > 1) {
        str.code = 0;
        str.msg = '您加入的对局已经开始，无法加入';
        ws.send(JSON.stringify(str));
        return
      }
    }
    if (params.code === 2) {
      str.code = 2;
      str.msg = '落子';
      str.x = params.x;
      str.y = params.y;
      wss.clients.forEach(function each(client) {
        if (client.doublePs === ws.doublePs) {
          str.colorType = params.colorType ? 0 : 1;
          str.gameColor = client.gameColor;
          client.send(JSON.stringify(str));
        }
      })
    }
    if (params.code === 3) {
      let str = {
        code: 2,
        msg: params.msg,
      }
      wss.clients.forEach(function each(client) {
        if (client.doublePs === ws.doublePs) {
          client.send(JSON.stringify(str));
          delete matchmaking[ws.doublePs];
        }
      })
    }
  });

  //客户端关闭触发
  ws.on('close', function close() {
    if(ws.doublePs && matchmaking[ws.doublePs] && matchmaking[ws.doublePs].length > 0){
      matchmaking[ws.doublePs].forEach((c)=>{
        if(c !== ws){
          c.send(JSON.stringify({
            code: 3,
            msg: '你的对手已逃跑，您赢得比赛',
          }));
        }   
      })
      delete matchmaking[ws.doublePs];
    }
  });
});

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": 'text/plain' })
  res.end('Hello World!');
});

server.listen(port, () => {
  console.log('Server listening on: http://localhost:%s', port);
})