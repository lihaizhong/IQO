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

/**
 * @author sky
 * @email 854323752@qq.com
 * @create date 2018-06-25 05:00:10
 * @modify date 2018-06-25 05:00:10
 * @desc 图片质量优化（Image Quality Optimize）
*/

/**
 * 构造函数
 * @param {Number} standard 基准值，表示是否需要进行图片缩放操作。默认：600
 */
function IQO(standard) {
  this.prefix = '[IQO]';
  this.standard = !isNaN(standard) && standard > 0 ? standard : 600;
  this._URLCompat();
}

var internal = IQO.prototype = {};

internal._URLCompat = function () {
  if (window.URL) {
    this.URL = window.URL;
  } else if (window.webkitURL) {
    this.URL = window.webkitURL;
  } else if (window.mozURL) {
    this.URL = window.mozURL;
  } else if (window.msURL) {
    this.URL = window.msURL;
  } else {
    this.URL = null;
  }
};

/**
 * 文件类型转换为url
 * @param {file}} file 
 */
internal._generateFileURL = function (file) {
  var _this = this;

  return new Promise(function (resolve, reject) {
    if (_this.URL) {
      resolve(_this.URL.createObjectURL(file));
    } else if (FileReader) {
      var fileReader = FileReader();

      fileReader.onload = function (evt) {
        resolve(evt.target.result);
      };

      fileReader.onerror = function (error) {
        reject(error);
      };

      fileReader.toDataURL();
    } else {
      reject(new Error('您的浏览器不支持window.URL和FileReader！'));
    }
  });
};

/**
 * 文件类型转换为图片类型
 * @param {base64} url 
 */
internal._file2Image = function (url) {
  var _this2 = this;

  return new Promise(function (resolve, reject) {
    var $$image = new Image();

    $$image.onload = function () {
      return resolve($$image);
    };
    $$image.onerror = function () {
      return reject(new Error(_this2.prefix + 'image loading failed!'));
    };
    $$image.src = url;
  });
};

/**
 * 图片绘制，压缩
 * @param {image} image 
 * @param {string} type 
 * @param {number} quality 
 * @param {number} scale 
 */
internal._drawImage = function (image, type, quality, scale) {
  var _this3 = this;

  return new Promise(function (resolve, reject) {
    // OPTIMIZE: 缩小体积以减小图片大小
    scale = image.width < _this3.standard && image.height < _this3.standard ? 1 : scale / 100;
    // OPTIMIZE: 减少质量以减小图片大小
    quality = quality / 100;

    if (!_this3.canvas) {
      _this3.canvas = document.createElement('canvas');
      _this3.ctx = _this3.canvas.getContext('2d');
    }

    var $$canvas = _this3.canvas;
    var ctx = _this3.ctx;

    var width = image.width * scale;
    var height = image.height * scale;

    $$canvas.width = width;
    $$canvas.height = height;
    try {
      // 完成blob对象的回调函数
      var done = function done(blob) {
        return resolve(blob);
      };
      // 1. 清除画布
      ctx.clearRect(0, 0, width, height);
      // 2. 在canvas中绘制图片
      ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
      // 3. 将图片转换成base64
      // NOTE: quality属性只有jpg和webp格式才有效
      if ($$canvas.toBlob) {
        $$canvas.toBlob(done, type, quality);
      } else {
        done(canvasToBlob($$canvas.toDataURL(type, quality)));
      }
    } catch (ex) {
      reject(ex);
    }
  });
};

/**
 * export 压缩
 * @param {file} file 
 * @param {number} quality 
 * @param {number} scale 
 */
IQO.prototype.compress = function (file, quality, scale) {
  var _this4 = this;

  var type = file.type || 'image/' + file.substr(file.lastIndexOf('.') + 1);
  var url1 = void 0;

  quality = Number(quality);
  if (isNaN(quality) || quality < 0 || quality > 100) {
    quality = 95;
  }

  scale = Number(scale);
  if (isNaN(scale) || scale < 0 || scale > 100) {
    scale = 70;
  }

  return this._generateFileURL(file).then(function (url) {
    url1 = url;
    return _this4._file2Image(url);
  }).then(function (image) {
    return _this4._drawImage(image, type, quality, scale);
  }).then(function (blob) {
    var result = null;

    // 释放url的内存
    _this4.URL && _this4.URL.revokeObjectURL(url1);
    if (blob && blob.size < file.size) {
      var date = new Date();
      blob.lastModified = date.getTime();
      blob.lastModifiedDate = date;
      blob.name = file.name;
      result = blob;
    } else {
      result = file;
    }

    return result;
  }).catch(function (error) {
    // 释放url的内存
    _this4.URL && _this4.URL.revokeObjectURL(url1);
    throw error;
  });
};

export default IQO;
