/*
 * @Author: tuWei
 * @Date: 2022-02-05 23:46:58
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-04-07 17:24:09
 */
class Reversi {
  constructor() {
    // 棋盘对象
    this.checkerboard = null;
    this.gameOver = '';
    this.message = '';
    this.Eles = {};
    this.sColorType = 0; //游戏模式、人机还是娱乐
    this.colorType = 0; // 当前需要下的棋子、 0黑色、1白色
    this.gameType = 0; //游戏类型 1.本地娱乐 2.与本地AI娱乐
    this.size = 8;
    this.gameId = ''; //游戏id
    this.Url = 'http://121.40.233.220:8080';
  }
  /**
   * 初始化棋盘
   */
  initReversi() {
    var that = this;
    this.createChess(this.size);
    this.checkerboard.addEventListener('click', function (event) {
      that.evtFn(event, true);
    });
    if (this.gameId) {
      Http.post({
        url: this.Url + '/blackandwhite/chooseColor',
        type: 'POST',
        data: {
          colorType: this.sColorType,
          gameId: this.gameId
        },
        success: res => {
          if (res.data && res.data.firstChess) {
            var data = res.data.firstChess;
            this.evtFn({ target: data });
          }
        }
      });
    }
  }
  /**
   * 创建棋盘
   */
  createChess(num) {
    this.checkerboard = document.createElement('div');
    this.checkerboard.className = 'container';
    var app = document.querySelector('#app');
    app.innerHTML = '';
    this.Eles = {};
    app.appendChild(this.checkerboard);
    for (let x = 0; x < num; x++) {
      for (let y = 0; y < num; y++) {
        var className = 'node';
        var node = document.createElement('div');
        //创建节点方法
        var Ele = this.createLEle(x, y);
        this.Eles[x + '-' + y] = Ele;
        node.appendChild(Ele);
        this.checkerboard.appendChild(node);
        if (num === 8) {
          className += ' wNode8';
          if (x === 3 && y === 3 || x === 4 && y === 4) {
            Ele.className = 'white';
            Ele.colorType = 1;
          }
          if (x === 3 && y === 4 || x === 4 && y === 3) {
            Ele.className = 'black';
            Ele.colorType = 0;
          }
        } else if (num === 10) {
          className += ' wNode10';
          if (x === 4 && y ===4 || x === 5 && y === 5 ) {
            Ele.className = 'white';
            Ele.colorType = 1;
          }
          if (x === 4 && y === 5 || x === 5 && y === 4 ) {
            Ele.className = 'black';
            Ele.colorType = 0;
          }
        }
        //level优先等级
        //level 0 最高权重
        //level 1 次优点
        //level 2 次差点
        //level 3 次次差点
        //level 4 最差权重
        if ((x === 0 || x === num - 1) && (y === 0 || y === num - 1)) {
          Ele.level = 0;
        } else if ((x < 2 || x > num - 3) && (y < 2 || y > num - 3)) {
          //最差权重
          Ele.level = 4;
        } else if ((x < 3 || x > num - 4) && (y < 3 || y > num - 4)) {
          //次优点
          Ele.level = 1;
        } else if ((x < 4 || x > num - 5) && (y < 4 || y > num - 5)) {
          //次差点
          Ele.level = 2;
        } else if ((x < 5 || x > num - 6) && (y < 5 || y > num - 6)) {
          //次次差点
          Ele.level = 3;
        }
        if (Ele.levelLabel) {
          node.innerText = Ele.levelLabel;
        }
        node.className = className;
      }
    }
    //连接链表
    Object.keys(this.Eles).forEach(key => {
      var x = Number(key.split('-')[0]);
      var y = Number(key.split('-')[1]);
      var ele = this.Eles[key];
      if (y - 1 > -1) {
        ele.Nl = this.Eles[x + '-' + (y - 1)];
      }
      if (y + 1 < num) {
        ele.Nr = this.Eles[x + '-' + (y + 1)];
      }
      if (x - 1 > -1) {
        ele.Nt = this.Eles[x - 1 + '-' + y];
      }
      if (x + 1 < num) {
        ele.Nb = this.Eles[x + 1 + '-' + y];
      }
      if (x - 1 > -1 && y - 1 > -1) {
        ele.Nlt = this.Eles[x - 1 + '-' + (y - 1)];
      }
      if (x + 1 < num && y - 1 > -1) {
        ele.Nlb = this.Eles[x + 1 + '-' + (y - 1)];
      }
      if (x - 1 > -1 && y + 1 < num) {
        ele.Nrt = this.Eles[x - 1 + '-' + (y + 1)];
      }
      if (x + 1 < num && y + 1 < num) {
        ele.Nrb = this.Eles[x + 1 + '-' + (y + 1)];
      }
    });
  }
  /**
   * 棋子事件委托
   */
  evtFn(event, flag) {
    if (this.gameOver && this.message) {
      this.showMessage(this.message, 10000);
      return;
    }
    var evt = this.Eles[event.target.x + '-' + event.target.y];
    if (evt) {
      var className = this.canFallingSeed(evt);
      if (className) {
        //翻转棋子
        this.checkDates(evt, true);
        evt.className = className;
        evt.colorType = this.colorType;
        this.colorType = this.colorType === 0 ? 1 : 0;
        //本地ai算法
        if (this.gameType === 2 && flag) {
          this.localAI();
        }
        if (this.gameType === 1 && flag) {
          Http.post({
            url: this.Url + '/blackandwhite/putChess',
            type: 'POST',
            data: {
              gameId: this.gameId,
              chess: {
                colorType: this.sColorType,
                x: evt.x,
                y: evt.y
              }
            },
            success: res => {
              if (res.data && res.data.computerResponseChess) {
                var data = res.data.computerResponseChess;
                this.evtFn({ target: data });
              }
            }
          });
        }
        this.isGameOver();
      } else {
        this.showMessage('不可下在此处');
      }
    }
  }
  //本地ai对局
  localAI() {
    //当前需要落子的所以棋子位置集合
    const Lists = [];
    //最高权重的所以集合
    const differentColor = new Set();
    //翻转棋子最多的长度
    const MaxList = [];
    let maxNum = 0;
    let levelListIndex = 0;
    for (const key in this.Eles) {
      if (Object.prototype.hasOwnProperty.call(this.Eles, key)) {
        const ele = this.Eles[key];
        if (ele.colorType === this.colorType) {
          Lists.push(ele);
        }
      }
    }
    Lists.forEach(item => {
      var keyList = ['Nl', 'Nr', 'Nt', 'Nb', 'Nlt', 'Nlb', 'Nrt', 'Nrb'];
      keyList.forEach(key => {
        let obj = item[key];
        //获取当前棋子的所有相邻棋子的空节点集合 differentColor
        if (obj && obj.colorType !== this.colorType && obj.colorType !== '') {
          this.getTheSeed(obj[key], key, differentColor);
        }
      });
    });
    let levelLists = this.getDifferentColorLevel(differentColor);
    if (levelLists.length === 0) {
      let meg = this.colorType === 0 ? '白棋获胜' : '黑棋获胜';
      this.showMessage('没有可下棋子, ' + meg);
      return;
    }
    //匹配翻转的棋子最多的落法
    levelLists.forEach((item, index) => {
      let evt = this.Eles[item.x + '-' + item.y];
      this.checkDates(evt, true, MaxList);
      if (maxNum < MaxList.length) {
        maxNum = MaxList.length;
        levelListIndex = index;
      }
    });
    this.evtFn({ target: levelLists[levelListIndex] });
  }
  //获取level权重最高的棋子集合
  getDifferentColorLevel(differentColor) {
    var level = 5;
    let levelLists = [];
    differentColor.forEach(item => {
      if (item.level < level) {
        level = item.level;
      }
    });
    differentColor.forEach(item => {
      if (item.level === level) {
        levelLists.push(item);
      }
    });
    return levelLists;
  }
  //获取ai落子的所有集合点
  getTheSeed(obj, key, differentColor) {
    //结束寻找落子点
    if (obj.colorType === '') {
      // let flag = differentColor.find((v)=>{
      //   if( v.x == obj.x && v.y == obj.y){
      //     return v
      //   }
      // })
      // if(!flag){
      differentColor.add(obj);
      // }
      return;
    }
    if (obj[key] && obj.colorType !== this.colorType) {
      this.getTheSeed(obj[key], key, differentColor);
    }
  }
  /***
   * 创建节点Ele节点
   * 8个方向节点创关联节点
   */
  createLEle(x, y) {
    var Ele = document.createElement('span');
    Ele.x = x;
    Ele.y = y;
    Ele.Nl = '';
    Ele.Nr = '';
    Ele.Nt = '';
    Ele.Nb = '';
    Ele.Nlt = '';
    Ele.Nlb = '';
    Ele.Nrt = '';
    Ele.Nrb = '';
    Ele.colorType = '';
    return Ele;
  }
  /**
   * 翻转棋子
   */
  flip(obj, key, listReversal) {
    //翻转结束递归
    if (obj.colorType === this.colorType) {
      return;
    }
    if (listReversal) {
      listReversal.push(obj);
    } else {
      obj.colorType = this.colorType;
      obj.className = this.colorType === 0 ? 'black' : 'white';
    }
    if (obj[key]) {
      this.flip(obj[key], key, listReversal);
    }
  }
  /**
   * 获取一个方向上的棋子颜色
   * @param {*} obj
   * @param {*} key
   * @param {*} Array
   */
  getEleColorType(obj, key, Array) {
    if (obj[key]) {
      Array.push(obj[key].colorType);
      this.getEleColorType(obj[key], key, Array);
    }
  }
  /**
   * obj 点击的节点 链表数据
   * * 是否可以落棋 需要判断棋子八个方向是否符合条件
   * isReversal 是否需要反转
   * listReversal 翻转的集合记录
   */
  checkDates(obj, isReversal, listReversal) {
    var keyList = ['Nl', 'Nr', 'Nt', 'Nb', 'Nlt', 'Nlb', 'Nrt', 'Nrb'];
    //所有方向满足或不满足的所有情况
    var flag = true;
    for (let index = 0; index < keyList.length; index++) {
      //key表示每一个方向
      const key = keyList[index];
      //节点的链表方向上的棋子颜色组合 0表示黑棋、1表示白棋
      let Array = [];
      this.getEleColorType(obj, key, Array);
      //this.colorType 是当前要落子的颜色;
      if (
        Array.indexOf(this.colorType) > 0 &&
        (Array.indexOf('') > Array.indexOf(this.colorType) || Array.indexOf('') === -1)
      ) {
        flag = false;
        if (isReversal) {
          this.flip(obj[key], key, listReversal);
        }
      }
    }
    return flag;
  }
  /**
   *
   * @param {*} meg
   * @returns
   */
  showMessage(meg, time) {
    const message = document.getElementById('message');
    message.style.display = 'block';
    message.innerText = meg;
    // console.log('不可以下在此处');
    setTimeout(() => {
      message.style.display = 'none';
    }, time || 1000);
  }
  /**
   * 检查是否可以下棋
   * @param {object} event
   */
  canFallingSeed(event) {
    var className = null;
    if (event.className) {
      return null;
    }
    //匹配落子规则
    if (this.checkDates(event)) {
      return null;
    }
    //匹配颜色
    if (this.colorType === 0) {
      className = 'black';
    } else {
      className = 'white';
    }
    return className;
  }
  /**
   * 判断游戏是否结束
   */
  isGameOver() {
    setTimeout(() => {
      //黑棋数量 //白旗数量
      let bNum = 0,
        wNum = 0;
      //所有空节点集合
      var Lists = [];
      for (const key in this.Eles) {
        // 链表连接
        if (Object.prototype.hasOwnProperty.call(this.Eles, key)) {
          const ele = this.Eles[key];
          if (ele.colorType === 0) {
            bNum++;
          } else if (ele.colorType === 1) {
            wNum++;
          } else {
            Lists.push(ele);
          }
        }
      }
      if (Lists.length) {
        var Flag = false;
        for (let index = 0; index < Lists.length; index++) {
          const ele = Lists[index];
          //判断剩余格子是否可以落子
          var className = this.canFallingSeed(ele);
          if (className) {
            Flag = true;
          }
        }
        if (!Flag) {
          if (bNum > wNum) {
            this.gameOver = true;
            this.message = '游戏结束，黑棋获胜';
          } else {
            this.gameOver = true;
            this.message = '游戏结束，白棋获胜';
          }
          this.showMessage(this.message, 10000);
        }
      } else {
        if (bNum > wNum) {
          this.gameOver = true;
          this.message = '游戏结束，黑棋获胜';
        } else {
          this.gameOver = true;
          this.message = '游戏结束，白棋获胜';
        }
        this.showMessage(this.message, 10000);
      }
    }, 10);
  }
}
