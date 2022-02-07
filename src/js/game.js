/*
 * @Author: tuWei
 * @Date: 2022-02-05 23:46:58
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-02-07 10:22:09
 */
class Reversi {
  constructor(){
    // 棋盘对象
    this.checkerboard = null, 
    //链表对象
    this.Eles = {};
    this.sColorType = 0; //游戏模式、人机还是娱乐
    this.colorType = 0; // 当前需要下的棋子、 0黑色、1白色
    this.gameType = 0; //游戏类型
    this.size = 8; 
    this.gameId = ''; //游戏id
    this.Url = 'http://121.40.233.220:8080';
  }
  /**
   * 初始化棋盘
   */
  initReversi (){
    var that = this;
    this.createChess(this.size);
    this.checkerboard.addEventListener('click', function (event) {
      that.evtFn(event, true)
    });

    if (this.gameId) {
      Http.post({
        url:  this.Url + '/blackandwhite/chooseColor',
        type: 'POST',
        data: {
          colorType: this.sColorType,
          gameId: this.gameId
        },
        success: (res) => {
          if (res.data && res.data.firstChess) {
            var data = res.data.firstChess;
            this.evtFn({target: data});
          }
        },
      });
    }
  }
  /**
   * 创建棋盘
   */
  createChess (num) {
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
        if (num == 8) { 
          className += ' wNode8';
          if ((x == 3 && y == 3) || (x == 4 && y == 4)) {
            Ele.className = 'white';
            Ele.colorType = 1;
          }
          if ((x == 3 && y == 4) || (x == 4 && y == 3)) {
            Ele.className = 'black';
            Ele.colorType = 0;
          }
        }else if(num == 10){
          className += ' wNode10';
          if ((x == 4 && y == 4) || (x == 5 && y == 5)) {
            Ele.className = 'white';
            Ele.colorType = 1;
          }
          if ((x == 4 && y == 5) || (x == 5 && y == 4)) {
            Ele.className = 'black';
            Ele.colorType = 0;
          }
        }
        node.className = className;
      }
    }
    //连接链表
    Object.keys(this.Eles).forEach((key)=>{
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
        ele.Nt = this.Eles[(x - 1) + '-' + y];
      }
      if (x + 1 < num) {
        ele.Nb = this.Eles[(x + 1) + '-' + y];
      }
      if (x - 1 > -1 && y - 1 > -1) { 
        ele.Nlt = this.Eles[(x - 1) + '-' + (y - 1)];
      }
      if (x + 1 < num && y - 1 > - 1) { 
        ele.Nlb = this.Eles[(x + 1) + '-' + (y - 1)];
      }
      if (x - 1 > -1 && y + 1 < num) {
        ele.Nrt = this.Eles[(x - 1) + '-' + (y + 1)];
      }
      if (x + 1 < num && y + 1 < num) {
        ele.Nrb = this.Eles[(x + 1) + '-' + (y + 1)];
      }
    })
  }
  /**
   * 棋子事件委托
   */
  evtFn(event, flag) {
    var evt = this.Eles[event.target.x + '-' + event.target.y];
    if (evt) {
      var className = this.canFallingSeed(evt);
      if (className) {
        //翻转棋子
        this.checkDates(evt, true);
        evt.className = className;
        evt.colorType = this.colorType;
        this.colorType = this.colorType === 0 ? 1 : 0;
        if (this.gameType == 1 && flag) {
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
            success: (res) => {
              if (res.data && res.data.computerResponseChess) {
                var data = res.data.computerResponseChess;
                this.evtFn({target: data});
              }
            },
          })
        }
        this.isGameOver();
      }else{
        this.showMessage('不可下在此处');
      }
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
  flip(obj, key) {
    //翻转结束递归
    if (obj.colorType == this.colorType) {
      return;
    }
    obj.colorType = this.colorType;
    obj.className = this.colorType == 0 ? 'black' : 'white';
    if (obj[key]) {
      this.flip(obj[key], key);
    }
  }
  /**
   * 获取一个方向上的棋子颜色
   * @param {*} obj 
   * @param {*} key 
   * @param {*} Array 
   */
  getEleColorType (obj, key, Array) {
    if (obj[key]) {
      Array.push(obj[key].colorType);
      this.getEleColorType(obj[key], key, Array);
    }
  }

  /**
   * obj 点击的节点 链表数据
   * * 是否可以落棋 需要判断棋子八个方向是否符合条件
   * isReversal 是否需要反转
   */
  checkDates (obj, isReversal) {
    var keyList = ['Nl', 'Nr', 'Nt', 'Nb', 'Nlt', 'Nlb', 'Nrt', 'Nrb'];
    //所有方向满足或不满足的所有情况
    var Flag = true;
    for (let index = 0; index < keyList.length; index++) {
      //key表示每一个方向
      const key = keyList[index];
      //节点的链表方向上的棋子颜色组合 0表示黑棋、1表示白棋
      let Array = [];
      this.getEleColorType(obj, key, Array);
      //this.colorType 是当前要落子的颜色;
      if (Array.indexOf(this.colorType) > 0 && (Array.indexOf('') > Array.indexOf(this.colorType) || Array.indexOf('') === -1)) {
        Flag = false;
        if (isReversal) {
          this.flip(obj[key], key);
        }
      }
    }
    return Flag;
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
    if (this.colorType == 0) {
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
    setTimeout(()=>{
      var NM = {
        b: 0, //黑棋数量
        w: 0  //白旗数量
      }
      //所有空节点集合
      var Lists = [];
      for (const key in this.Eles) { // 链表连接
        if (this.Eles.hasOwnProperty(key)) {
          const ele = this.Eles[key];
          if (ele.colorType === 0) {
            NM.b++;
          } else if (ele.colorType === 1) {
            NM.w++;
          } else {
            Lists.push(ele);
          }
        }
      }
      if (Lists.length) {
        var Flag = false
        for (let index = 0; index < Lists.length; index++) {
          const ele = Lists[index];
          //判断剩余格子是否可以落子
          var className = this.canFallingSeed(ele);
          if (className) {
            Flag = true;
          }
        }
        if (!Flag) {
          if (NM.b > NM.w) {
            this.showMessage('黑棋获胜', 10000);
          } else {
            this.showMessage('白棋获胜', 10000);
          }
        }
      } else {
        if (NM.b > NM.w) {
          this.showMessage('黑棋获胜', 10000);
        } else {
          this.showMessage('白棋获胜', 10000);
        }
      }
    },10)
  }
}