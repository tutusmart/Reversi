/*
 * @Author: tuWei
 * @Date: 2022-02-05 22:36:22
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-02-06 22:36:23
 */
/**
 * 封装http请求
 */
 class Http {
  static post(options) {
    var http = new XMLHttpRequest() || new ActiveXObject('Microsoft.XMLHTTP');
    var {type, data, url} = options;
    const args = {
      param: data,
      ip: '',
      sid: '',
    }
    http.open(type, url, true); 
    http.setRequestHeader('Content-type','application/json;charset=UTF-8'); 
    http.onreadystatechange = function () {
      //请求已完成且响应已就绪
      if (http.readyState === 4) {
        if (http.status === 200 ) {
          var res = JSON.parse(http.response);
          if (res.opFlag) {
            options.success(res.serviceResult || {});
          } else {
            this.showMessage('服务异常');
          }
        } else {
          this.showMessage('服务异常');
          if(options.error){
            options.error(http);
          }
        }
      }
    }
    http.send(JSON.stringify(args));
  }
}