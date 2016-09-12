import fetch from 'isomorphic-fetch';


function req(url, options = {}, callback) {
  function Req() {
    this.ret = { 
      url,
      success: false,
      status_code: null,
      status_text: 'unknown',
      result: null,
    };  

    const _self = this;


    const checkStatus = (response) => {
      if (response.status >= 200 && response.status < 300) {
        _self.ret.success = true;
      } else {
        const error = new Error(response.statusText);
        error.response = response;
        throw error;
      }   
      _self.ret.status_code = response.status;
      _self.ret.status_text = response.statusText;

      return response;
    };
    
    
        fetch(url, options)
      .then(checkStatus)
      .then(response => response.json())
      .then((data) => {
        const ret = _self.ret;

        ret.result = data;
        return callback(ret);
      })
      .catch((error) => {
        // 请求未到达服务器的错误
        if (!_self.ret.status_code) {
          _self.ret.status_code = error.code;
          _self.ret.status_text = error.message;
          throw error;
        }
        _self.ret.error = error;

        return callback(_self.ret);
      });
  }

  return new Req();
}

export default function reqAsync(url, options) {
  return new Promise(
    (resolve) => req(url, options, (result) => resolve(result))
  );
}

export { req };
