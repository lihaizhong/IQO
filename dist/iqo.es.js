/**
 * iqo 0.1.16
 * lihz <854323752@qq.com>
 * Released under the MIT License.
 */

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var canvasToBlob = createCommonjsModule(function (module) {
(function(window) {

  var CanvasPrototype =
    window.HTMLCanvasElement && window.HTMLCanvasElement.prototype;
  var hasBlobConstructor =
    window.Blob &&
    (function() {
      try {
        return Boolean(new Blob())
      } catch (e) {
        return false
      }
    })();
  var hasArrayBufferViewSupport =
    hasBlobConstructor &&
    window.Uint8Array &&
    (function() {
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
    function(dataURI) {
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
      CanvasPrototype.toBlob = function(callback, type, quality) {
        var self = this;
        setTimeout(function() {
          if (quality && CanvasPrototype.toDataURL && dataURLtoBlob) {
            callback(dataURLtoBlob(self.toDataURL(type, quality)));
          } else {
            callback(self.mozGetAsFile('blob', type));
          }
        });
      };
    } else if (CanvasPrototype.toDataURL && dataURLtoBlob) {
      CanvasPrototype.toBlob = function(callback, type, quality) {
        var self = this;
        setTimeout(function() {
          callback(dataURLtoBlob(self.toDataURL(type, quality)));
        });
      };
    }
  }
  if ( module.exports) {
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
  this.URL = this._URLCompat();
}

var internal = IQO.prototype = {
  constructor: IQO
};
/**
 * 兼容的url生成器
 */

internal._URLCompat = function () {
  if ('URL' in window && typeof window.URL.createObjectURL === 'function') {
    return window.URL;
  } else if ('webkitURL' in window) {
    return window.webkitURL;
  } else if ('mozURL' in window) {
    return window.mozURL;
  } else if ('msURL' in window) {
    return window.msURL;
  }

  return null;
};
/**
 * 通过window.URL生成文件url
 * @param {file} file
 */


internal._generateFileURLByURL = function (file) {
  return this.URL.createObjectURL(file);
};
/**
 * 通过FileReader类生成文件url
 */


internal._generateFileURLByFileReader = function (file, success, fail) {
  var fileReader = new FileReader();

  fileReader.onload = function () {
    success(fileReader.result);
  };

  fileReader.onerror = fail;
  fileReader.readAsDataURL(file);
};
/**
 * 生成文件url
 * @param {file}} file
 */


internal._generateFileURL = function (file) {
  var _this = this;

  return new Promise(function (resolve, reject) {
    if (_this.URL) {
      resolve(_this._generateFileURLByURL(file));
    } else if ('FileReader' in window) {
      _this._generateFileURLByFileReader(file, resolve, reject);
    } else {
      reject(new Error('您的浏览器不支持window.URL和FileReader！'));
    }
  });
};
/**
 * 注销文件url
 * @param {string} url
 */


internal._revokeFileURL = function (url) {
  this.URL && this.URL.revokeObjectURL(url);
};
/**
 * 文件类型转换为图片类型
 * @param {base64} url
 */


internal._file2Image = function (url) {
  var _this2 = this;

  return new Promise(function (resolve, reject) {
    var image = new Image();

    image.onload = function () {
      return resolve(image);
    };

    image.onerror = function (error) {
      console.error(_this2.prefix + '图片加载失败！', error);
      reject(error);
    };

    image.src = url;
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
    scale = image.width < _this3.standard && image.height < _this3.standard ? 1 : scale / 100; // OPTIMIZE: 减少质量以减小图片大小

    quality = quality / 100;

    if (!_this3.canvas) {
      // const iframe = document.createElement('iframe')
      // iframe.style.cssText = 'display: none;'
      // document.body.appendChild(iframe)
      _this3.canvas = document.createElement('canvas'); // iframe.document.body.appendChild(this.canvas)

      _this3.ctx = _this3.canvas.getContext('2d');
    }

    var $$canvas = _this3.canvas;
    var ctx = _this3.ctx;
    var width = image.width * scale;
    var height = image.height * scale; // 设置canvas的尺寸

    $$canvas.setAttribute('width', width);
    $$canvas.setAttribute('height', height);
    $$canvas.width = width;
    $$canvas.height = height;

    try {
      // 1. 清除画布
      ctx.clearRect(0, 0, width, height);
      ctx.save(); // 2. 在canvas中绘制图片

      ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
      ctx.restore(); // 4. 将图片转换成base64
      // NOTE: quality属性只有jpg和webp格式才有效

      if ($$canvas.toBlob) {
        $$canvas.toBlob(resolve, type, quality);
      } else {
        resolve(canvasToBlob($$canvas.toDataURL(type, quality)));
      }

      ctx.clearRect(0, 0, width, height);
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

  var fileName = file.name || '';
  var fileType = file.type; // 生成浏览器可访问的url

  var generatedUrl = null; // 文件类型没有获取到

  if (!fileType) {
    fileType = fileName ? 'image/' + fileName.substr(fileName.lastIndexOf('.') + 1) : 'image/jpg';
  } // 文件的压缩质量


  quality = Number(quality);

  if (isNaN(quality) || quality <= 0 || quality > 100) {
    quality = 70;
  } // 文件的缩放比例


  scale = Number(scale);

  if (isNaN(scale) || scale <= 0 || scale > 100) {
    scale = 70;
  }

  return this._generateFileURL(file) // 将文件转化为图片
  .then(function (url) {
    return _this4._file2Image(generatedUrl = url);
  }) // 在canvas上绘制图片
  .then(function (image) {
    return _this4._drawImage(image, fileType, quality, scale);
  }) // 比较生成的图片与原图的大小
  .then(function (blob) {
    // 适配结果图片
    if (blob && blob.size > 0 && blob.size < file.size) {
      var date = new Date();
      blob.lastModified = date.getTime();
      blob.lastModifiedDate = date;
      blob.name = file.name;
      return blob;
    }

    return file;
  }).catch(function (error) {
    console.error(error);
    return file;
  }).then(function (finalFile) {
    // 释放url的内存
    _this4._revokeFileURL(generatedUrl);

    return finalFile;
  });
};

export default IQO;
