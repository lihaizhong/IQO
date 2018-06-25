(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@babel/runtime/core-js/promise'), require('@babel/runtime/helpers/classCallCheck'), require('@babel/runtime/helpers/createClass'), require('@babel/runtime/helpers/defineProperty'), require('blueimp-canvas-to-blob')) :
  typeof define === 'function' && define.amd ? define(['@babel/runtime/core-js/promise', '@babel/runtime/helpers/classCallCheck', '@babel/runtime/helpers/createClass', '@babel/runtime/helpers/defineProperty', 'blueimp-canvas-to-blob'], factory) :
  (global.IQO = factory(global._Promise,global._classCallCheck,global._createClass,global._defineProperty));
}(this, (function (_Promise,_classCallCheck,_createClass,_defineProperty) { 'use strict';

  _Promise = _Promise && _Promise.hasOwnProperty('default') ? _Promise['default'] : _Promise;
  _classCallCheck = _classCallCheck && _classCallCheck.hasOwnProperty('default') ? _classCallCheck['default'] : _classCallCheck;
  _createClass = _createClass && _createClass.hasOwnProperty('default') ? _createClass['default'] : _createClass;
  _defineProperty = _defineProperty && _defineProperty.hasOwnProperty('default') ? _defineProperty['default'] : _defineProperty;

  var IQO =
  /*#__PURE__*/
  function () {
    function IQO(width, height) {
      _classCallCheck(this, IQO);

      _defineProperty(this, "standardWidth", 600);

      _defineProperty(this, "standardHeight", 600);

      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');

      if (!window.URL) {
        window.URL = window.webkitURL || window.mozURL;
      }

      if (width && width > 0) {
        this.standardWidth = width;
      }

      if (height && height > 0) {
        this.standardHeight = height;
      }
    }

    _createClass(IQO, [{
      key: "_file2Image",
      value: function _file2Image(url) {
        return new _Promise(function (resolve, reject) {
          var image = new Image();

          image.onload = function () {
            return resolve(image);
          };

          image.onerror = function (error) {
            return reject(error);
          };

          image.src = url;
        });
      } // 测试结果：在图片质量调至45、原图宽高在1000左右的情况下，图片大小下降近5倍

    }, {
      key: "_drawImage",
      value: function _drawImage(image, type, quality) {
        var _this = this;

        return new _Promise(function (resolve) {
          var rate = image.width / image.height;
          var width = null;
          var height = null; // Optimize: 缩小体积以减小图片大小

          if (image.width <= _this.standardWidth && image.height <= _this.standardHeight) {
            width = image.width;
            height = image.height;
          } else if (image.width > image.height) {
            width = _this.standardWidth;
            height = _this.standardWidth / rate;
          } else if (image.width < image.height) {
            width = _this.standardHeight * rate;
            height = _this.standardHeight;
          } else {
            width = _this.standardWidth;
            height = _this.standardHeight;
          }

          _this.canvas.width = width;
          _this.canvas.height = height; // 在canvas中绘制图片

          _this.ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height); // 将图片转换成Blob对象


          _this.canvas.toBlob( // Optimize: 改变图片质量以减小图片体积
          function (blob) {
            return resolve(blob);
          }, type, quality / 100);
        });
      }
    }, {
      key: "compress",
      value: function compress(file, quality) {
        var _this2 = this;

        quality = Number(quality);
        var type = file.type || 'image/' + file.substr(file.lastIndexOf('.') + 1);

        if (isNaN(quality) || quality < 0 || quality > 100) {
          quality = 95;
        }

        var url = window.URL.createObjectURL(file);
        return this._file2Image(url).then(function (image) {
          return _this2._drawImage(image, type, quality).then(function (blob) {
            // test(blob, file)
            window.URL.revokeObjectURL(url);
            return blob.size < file.size ? blob : file;
          }).catch(function (error) {
            window.URL.revokeObjectURL(url);
            throw error;
          });
        }).catch(function (error) {
          window.URL.revokeObjectURL(url);
          throw error;
        });
      }
    }]);

    return IQO;
  }();

  return IQO;

})));
