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

var internal = IQO.prototype = {
  constructor: IQO
};

internal._URLCompat = function () {
  if ('URL' in window) {
    this.URL = window.URL;
  } else if ('webkitURL' in window) {
    this.URL = window.webkitURL;
  } else if ('mozURL' in window) {
    this.URL = window.mozURL;
  } else if ('msURL' in window) {
    this.URL = window.msURL;
  } else {
    this.URL = null;
  }
};

internal._generateFileURLByURL = function (file) {
  // console.log('使用window.URL生成URL')
  return this.URL.createObjectURL(file);
};

internal._generateFileURLByFileReader = function (file, success, fail) {
  // console.log('使用FileReader生成URL')
  var fileReader = new FileReader();

  fileReader.onload = function () {
    success(fileReader.result);
  };

  fileReader.onerror = function (error) {
    // console.log('FileReader读取文件失败')
    fail(error);
  };

  fileReader.readAsDataURL(file);
};

/**
 * 文件类型转换为url
 * @param {file}} file
 */
internal._generateFileURL = function (file) {
  var _this = this;

  return new Promise(function (resolve, reject) {
    // console.log('将文件类型转换成URL')
    if (_this.URL) {
      resolve(_this._generateFileURLByURL(file));
    } else if ('FileReader' in window) {
      _this._generateFileURLByFileReader(file, function (url) {
        resolve(url);
      }, function (error) {
        reject(error);
      });
    } else {
      // console.log('您的浏览器不支持window.URL和FileReader！')
      reject(new Error('您的浏览器不支持window.URL和FileReader！'));
    }
  });
};

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
    console.log('加载图片');
    var image = new Image();

    image.onload = function () {
      return resolve(image);
    };
    image.onerror = function (error) {
      console.log(_this2.prefix + '图片加载失败！', error);
      reject(error);
    };

    image.src = url;
  });
};

/**
 * 获取到canvas每一个像素，然后检查这张图片是否是黑色的图片
 * 注：不对黑色的图片进行压缩
 * @param {array} imageData 
 */
internal._checkImageData = function (imageData) {
  var len = imageData ? imageData.length : 0;
  var otherData = 0;

  if (len) {
    for (var i = 0; i < len; i += 4) {
      var r = imageData[i];
      var g = imageData[i + 1];
      var b = imageData[i + 2];

      if (r !== 0 && g !== 0 && b !== 0) {
        otherData++;
      }
    }
  }

  return otherData !== 0;
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
    // console.log('开始画图')
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

    $$canvas.setAttribute('width', width);
    $$canvas.setAttribute('height', height);
    $$canvas.width = width;
    $$canvas.height = height;

    // console.log('是否支持toBlob：' + (typeof $$canvas.toBlob === 'function'))
    try {
      // 完成blob对象的回调函数
      var done = function done(blob) {
        return resolve(blob);
      };
      // 1. 清除画布
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      // 2. 在canvas中绘制图片
      ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
      ctx.restore();
      var imageData = ctx.getImageData(0, 0, width, height);
      if (!_this3._checkImageData(imageData)) {
        reject(new Error('不对全黑图片进行压缩操作！'));
        return;
      }
      // 4. 将图片转换成base64
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
  var url1 = null;

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
    _this4._revokeFileURL(url1);
    if (blob && blob.size < file.size) {
      var date = new Date();
      blob.lastModified = date.getTime();
      blob.lastModifiedDate = date;
      blob.name = file.name;
      result = blob;
    } else {
      result = file;
    }
    // console.log(Object.prototype.toString.call(result))

    return result;
  }).catch(function (error) {
    // 释放url的内存
    _this4._revokeFileURL(url1);
    // console.log('文件压缩失败！', error)
    console.error(error);
    return file;
  });
};

export default IQO;
