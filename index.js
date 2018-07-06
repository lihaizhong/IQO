/**
 * @author sky
 * @email 854323752@qq.com
 * @create date 2018-06-25 05:00:10
 * @modify date 2018-06-25 05:00:10
 * @desc 图片质量优化（Image Quality Optimize）
*/

import 'blueimp-canvas-to-blob'

/**
 * 构造函数
 * @param {Number} standard 基准值，表示是否需要进行图片缩放操作。默认：600
 */
function IQO (standard) {
  this.prefix = '[IQO]'
  this.standard = !isNaN(standard) && standard > 0 ? standard : 600
  this._URLCompat()
}

var internal = IQO.prototype = {}

internal._URLCompat = function () {
  if (window.URL) {
    this.URL = window.URL
  } else if (window.webkitURL) {
    this.URL = window.webkitURL
  } else if (window.mozURL) {
    this.URL = window.mozURL
  } else if (window.msURL) {
    this.URL = window.msURL
  } else {
    throw new Error(this.prefix + '`window.URL` is not support! please update your browser.')
  }
}

internal._file2Image = function (url) {
  return new Promise((resolve, reject) => {
    let $$image = new Image()
    // if (this.image) {
    //   $$image = this.image
    // } else {
    //   // FIXBUG: 兼容部分机型不创建真实 IMG DOM，无法实现跨域问题
    //   $$image = this.image = document.createElement('img')
    //   $$image.crossOrigin = 'Anonymous'
    //   $$image.style.display = 'none'
    //   document.body.append($$image)
    // }

    $$image.onload = () => resolve($$image)
    $$image.onerror = () => reject(new Error(this.prefix + 'image loading failed!'))
    $$image.src = url

    // 确保缓存的图片也能触发onload事件
    if ($$image.complete || $$image.complete === 'undefined') {
      $$image.src = 'data:image/jpeg;base64,clean' + new Date()
      $$image.src = url
    }
  })
}

internal._drawImage = function (image, type, quality, scale) {
  return new Promise((resolve, reject) => {
    // Optimize: 缩小体积以减小图片大小
    if (image.width < this.standard && image.height < this.standard) {
      scale = 1
    } else {
      scale = scale / 100
    }

    if (!this.canvas) {
      this.canvas = document.createElement('canvas')
      this.ctx = this.canvas.getContext('2d')
    }

    let $$canvas = this.canvas
    let ctx = this.ctx

    let width = image.width * scale
    let height = image.height * scale

    $$canvas.width = width
    $$canvas.height = height
    try {
      // 1. 清除画布
      ctx.clearRect(0, 0, width, height)
      // 2. 在canvas中绘制图片
      ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height)
      // 3. 将图片转换成base64
      // NOTE: quality属性只有jpg和webp格式才有效
      $$canvas.toBlob(blob => resolve(blob), type, quality / 100)
    } catch (ex) {
      reject(ex)
    }
  })
}

IQO.prototype.compress = function (file, quality, scale) {
  let type = file.type || 'image/' + file.substr(file.lastIndexOf('.') + 1)

  quality = Number(quality)
  if (isNaN(quality) || quality < 0 || quality > 100) {
    quality = 95
  }

  scale = Number(scale)
  if (isNaN(scale) || scale < 0 || scale > 100) {
    scale = 70
  }

  // 创建一个url，
  let url = this.URL.createObjectURL(file)

  return this._file2Image(url)
    .then(image => this._drawImage(image, type, quality, scale))
    .then(blob => {
      this.URL.revokeObjectURL(url)
      // 与原文件比较大小，取最小的那个文件
      return blob.size < file.size ? blob : file
    })
    .catch(error => {
      this.URL.revokeObjectURL(url)
      throw error
    })
}

export default IQO
