/*
 * @Author: tuWei
 * @Date: 2022-02-05 23:46:58
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-04-08 11:03:33
 */
const R = new Reversi(),
  boxTop = document.querySelector('#box-top'),
  Url = document.querySelector('#url'),
  gType = document.querySelector('#g-type'),
  size = document.querySelector('#size');

function openSet() {
  setBox.style.display = 'block';
  boxTop.style.display = 'none';
}
function changeCor() {
  R.sColorType = color.value - 0;
}
function changeTye() {
  R.gameType = gType.value - 0;
}
function changeUrl() {
  R.Url = Url.value;
}
function changeSize() {
  R.size = size.value - 0;
}
function startGame() {
  if (R.gameType === 1 && !R.Url) {
    R.showMessage('请输入服务器地址');
    return;
  }
  R.colorType = R.sColorType;
  R.gameOver = '';
  R.message = '';
  if (R.gameType === 1) {
    Http.post({
      url: R.Url + '/blackandwhite/openGame',
      type: 'POST',
      data: {
        dimension: R.size - 0,
        gameType: 1,
      },
      success: res => {
        setBox.style.display = 'none';
        boxTop.style.display = 'block';
        //获取游戏id
        R.gameId = res.data ? res.data.gameId : '';
        R.initReversi();
      },
      error: () => {},
    });
  } else {
    setBox.style.display = 'none';
    boxTop.style.display = 'block';
    R.initReversi();
  }
}
