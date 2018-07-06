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
 * @param {Number} standard 基准值，表示是否需要进行缩放操作。默认：600
 */
function IQO (standard) {
  this.prefix = '[IQO]'
  this._URLCompat()

  if (!isNaN(standard) && standard > 0) {
    this.standard = standard
  } else {
    this.standard = 600
  }
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
    let $$image
    if (this.image) {
      $$image = this.image
    } else {
      $$image = this.image = document.createElement('img')
      $$image.style.display = 'none'
      document.body.append($$image)
    }

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
      scale = 100
    }

    let $$canvas
    let ctx
    if (this.canvas) {
      $$canvas = this.canvas
      ctx = this.ctx
    } else {
      $$canvas = this.canvas = document.createElement('canvas')
      ctx = this.ctx = $$canvas.getContext('2d')
    }

    let width = image.width * scale / 100
    let height = image.height * scale / 100

    $$canvas.width = width
    $$canvas.height = height
    try {
      // 在canvas中绘制图片
      ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height)
      // 将图片转换成base64
      // Note: quality属性只有jpg和webp格式才有效
      $$canvas.toBlob(blob => {
        // 清除画布
        ctx.clearRect(0, 0, width, height)
        resolve(blob)
      }, type, quality / 100)
    } catch (ex) {
      ctx.clearRect(0, 0, width, height)
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

  let url = this.URL.createObjectURL(file)

  return this._file2Image(url)
    .then(image => this._drawImage(image, type, quality, scale))
    .then(blob => {
      this.URL.revokeObjectURL(url)
      return blob.size < file.size ? blob : file
    })
    .catch(error => {
      this.URL.revokeObjectURL(url)
      throw error
    })
}

export default IQO
