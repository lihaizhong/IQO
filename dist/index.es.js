function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var canvasToBlob = createCommonjsModule(function (module) {
(function (window) {

  var CanvasPrototype =
    window.HTMLCanvasElement && window.HTMLCanvasElement.prototype;
  var hasBlobConstructor =
    window.Blob &&
    (function () {
      try {
        return Boolean(new Blob())
      } catch (e) {
        return false
      }
    })();
  var hasArrayBufferViewSupport =
    hasBlobConstructor &&
    window.Uint8Array &&
    (function () {
      try {
        return new Blob([new Uint8Array(100)]).size === 100
      } catch (e) {
        return false
      }
    })();
  var BlobBuilder =
    window.BlobBuilder ||
    window.WebKitBlobBuilder ||
    window.MozBlobBuilder ||
    window.MSBlobBuilder;
  var dataURIPattern = /^data:((.*?)(;charset=.*?)?)(;base64)?,/;
  var dataURLtoBlob =
    (hasBlobConstructor || BlobBuilder) &&
    window.atob &&
    window.ArrayBuffer &&
    window.Uint8Array &&
    function (dataURI) {
      var matches,
        mediaType,
        isBase64,
        dataString,
        byteString,
        arrayBuffer,
        intArray,
        i,
        bb;
      // Parse the dataURI components as per RFC 2397
      matches = dataURI.match(dataURIPattern);
      if (!matches) {
        throw new Error('invalid data URI')
      }
      // Default to text/plain;charset=US-ASCII
      mediaType = matches[2]
        ? matches[1]
        : 'text/plain' + (matches[3] || ';charset=US-ASCII');
      isBase64 = !!matches[4];
      dataString = dataURI.slice(matches[0].length);
      if (isBase64) {
        // Convert base64 to raw binary data held in a string:
        byteString = atob(dataString);
      } else {
        // Convert base64/URLEncoded data component to raw binary:
        byteString = decodeURIComponent(dataString);
      }
      // Write the bytes of the string to an ArrayBuffer:
      arrayBuffer = new ArrayBuffer(byteString.length);
      intArray = new Uint8Array(arrayBuffer);
      for (i = 0; i < byteString.length; i += 1) {
        intArray[i] = byteString.charCodeAt(i);
      }
      // Write the ArrayBuffer (or ArrayBufferView) to a blob:
      if (hasBlobConstructor) {
        return new Blob([hasArrayBufferViewSupport ? intArray : arrayBuffer], {
          type: mediaType
        })
      }
      bb = new BlobBuilder();
      bb.append(arrayBuffer);
      return bb.getBlob(mediaType)
    };
  if (window.HTMLCanvasElement && !CanvasPrototype.toBlob) {
    if (CanvasPrototype.mozGetAsFile) {
      CanvasPrototype.toBlob = function (callback, type, quality) {
        var self = this;
        setTimeout(function () {
          if (quality && CanvasPrototype.toDataURL && dataURLtoBlob) {
            callback(dataURLtoBlob(self.toDataURL(type, quality)));
          } else {
            callback(self.mozGetAsFile('blob', type));
          }
        });
      };
    } else if (CanvasPrototype.toDataURL && dataURLtoBlob) {
      CanvasPrototype.toBlob = function (callback, type, quality) {
        var self = this;
        setTimeout(function () {
          callback(dataURLtoBlob(self.toDataURL(type, quality)));
        });
      };
    }
  }
  if (module.exports) {
    module.exports = dataURLtoBlob;
  } else {
    window.dataURLtoBlob = dataURLtoBlob;
  }
})(window);
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var IQO = function () {
  /**
   * 构造函数
   * @param {Number} standard 基准值，表示是否需要进行缩放操作。默认：600
   */
  function IQO(standard) {
    _classCallCheck(this, IQO);

    this.prefix = '[IQO]';
    this._URLCompat();

    if (!isNaN(standard) && standard > 0) {
      this.standard = standard;
    } else {
      this.standard = 600;
    }
  }

  _createClass(IQO, [{
    key: '_URLCompat',
    value: function _URLCompat() {
      if (window.URL) {
        this.URL = window.URL;
      } else if (window.webkitURL) {
        this.URL = window.webkitURL;
      } else if (window.mozURL) {
        this.URL = window.mozURL;
      } else if (window.msURL) {
        this.URL = window.msURL;
      } else {
        throw new Error(this.prefix + '`window.URL` is not support! please update your browser.');
      }
    }
  }, {
    key: '_file2Image',
    value: function _file2Image(url) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var $$image = void 0;
        if (_this.image) {
          $$image = _this.image;
        } else {
          $$image = _this.image = document.createElement('img');
          $$image.style.display = 'none';
          document.body.append($$image);
        }

        $$image.onload = function () {
          return resolve($$image);
        };
        $$image.onerror = function () {
          return reject(new Error(_this.prefix + 'image loading failed!'));
        };
        $$image.src = url;

        // 确保缓存的图片也能触发onload事件
        if ($$image.complete || $$image.complete === 'undefined') {
          $$image.src = 'data:image/jpeg;base64,clean' + new Date();
          $$image.src = url;
        }
      });
    }

    // 测试结果：在图片质量调至45、原图宽高在1000左右的情况下，图片大小下降近5倍

  }, {
    key: '_drawImage',
    value: function _drawImage(image, type, quality, scale) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        // Optimize: 缩小体积以减小图片大小
        if (image.width < _this2.standard && image.height < _this2.standard) {
          scale = 1;
        }

        var $$canvas = void 0;
        var ctx = void 0;
        if (_this2.canvas) {
          $$canvas = _this2.canvas;
          ctx = _this2.ctx;
        } else {
          $$canvas = _this2.canvas = document.createElement('canvas');
          ctx = _this2.ctx = $$canvas.getContext('2d');
        }

        var width = image.width * scale / 100;
        var height = image.height * scale / 100;

        $$canvas.width = width;
        $$canvas.height = height;
        try {
          // 在canvas中绘制图片
          ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
          // 将图片转换成base64
          // Note: quality属性只有jpg和webp格式才有效
          $$canvas.toBlob(function (blob) {
            // 清除画布
            ctx.clearRect(0, 0, width, height);
            resolve(blob);
          }, type, quality / 100);
        } catch (ex) {
          ctx.clearRect(0, 0, width, height);
          reject(ex);
        }
      });
    }
  }, {
    key: 'compress',
    value: function compress(file, quality, scale) {
      var _this3 = this;

      var type = file.type || 'image/' + file.substr(file.lastIndexOf('.') + 1);

      quality = Number(quality);
      if (isNaN(quality) || quality < 0 || quality > 100) {
        quality = 95;
      }

      scale = Number(scale);
      if (isNaN(scale) || scale < 0 || scale > 100) {
        scale = 70;
      }

      var url = this.URL.createObjectURL(file);

      return this._file2Image(url).then(function (image) {
        return _this3._drawImage(image, type, quality, scale);
      }).then(function (blob) {
        _this3.URL.revokeObjectURL(url);
        return blob.size < file.size ? blob : file;
      }).catch(function (error) {
        _this3.URL.revokeObjectURL(url);
        throw error;
      });
    }
  }]);

  return IQO;
}();

export default IQO;
