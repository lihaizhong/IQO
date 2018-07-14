/**
 * @author sky
 * @email 854323752@qq.com
 * @create date 2018-06-25 05:00:10
 * @modify date 2018-06-25 05:00:10
 * @desc 图片质量优化（Image Quality Optimize）
*/

import toBlob from 'blueimp-canvas-to-blob'

/**
 * 构造函数
 * @param {Number} standard 基准值，表示是否需要进行图片缩放操作。默认：600
 */
function IQO (standard) {
  this.prefix = '[IQO]'
  this.standard = !isNaN(standard) && standard > 0 ? standard : 600
  this._URLCompat()
}

var internal = IQO.prototype = {
  constructor: IQO
}

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
    this.URL = null
  }
}

/**
 * 文件类型转换为url
 * @param {file}} file 
 */
internal._generateFileURL = function (file) {
  return new Promise((resolve, reject) => {
    if (this.URL) {
      resolve(this.URL.createObjectURL(file))
    } else if (FileReader) {
      let fileReader = new FileReader()
      
      fileReader.onload = function () {
        resolve(this.result)
      }

      fileReader.onerror = function (error) {
        reject(error)
      }

      fileReader.readAsDataURL(file)
    } else {
      reject(new Error('您的浏览器不支持window.URL和FileReader！'))
    }
  })
}

/**
 * 文件类型转换为图片类型
 * @param {base64} url 
 */
internal._file2Image = function (url) {
  return new Promise((resolve, reject) => {
    let image = new Image()

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(this.prefix + 'image loading failed!'))
    image.src = url
  })
}

/**
 * 图片绘制，压缩
 * @param {image} image 
 * @param {string} type 
 * @param {number} quality 
 * @param {number} scale 
 */
internal._drawImage = function (image, type, quality, scale) {
  return new Promise((resolve, reject) => {
    // OPTIMIZE: 缩小体积以减小图片大小
    scale = image.width < this.standard && image.height < this.standard ? 1 : scale / 100
    // OPTIMIZE: 减少质量以减小图片大小
    quality = quality /100

    if (!this.canvas) {
      this.canvas = document.createElement('canvas')
      this.ctx = this.canvas.getContext('2d')
    }

    let $$canvas = this.canvas
    let ctx = this.ctx

    let width = image.width * scale
    let height = image.height * scale

    $$canvas.setAttribute('width', width)
    $$canvas.setAttribute('height', height)
    $$canvas.width = width
    $$canvas.height = height

    try {
      // 完成blob对象的回调函数
      let done = (blob) => resolve(blob)
      // 1. 清除画布
      ctx.clearRect(0, 0, width, height)
      // 2. 在canvas中绘制图片
      ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height)
      // 3. 将图片转换成base64
      // NOTE: quality属性只有jpg和webp格式才有效
      if ($$canvas.toBlob) {
        $$canvas.toBlob(done, type, quality)
      } else {
        done(toBlob($$canvas.toDataURL(type, quality)))
      }
    } catch (ex) {
      reject(ex)
    }
  })
}

/**
 * export 压缩
 * @param {file} file 
 * @param {number} quality 
 * @param {number} scale 
 */
IQO.prototype.compress = function (file, quality, scale) {
  let type = file.type || 'image/' + file.substr(file.lastIndexOf('.') + 1)
  let url1 = null

  quality = Number(quality)
  if (isNaN(quality) || quality < 0 || quality > 100) {
    quality = 95
  }

  scale = Number(scale)
  if (isNaN(scale) || scale < 0 || scale > 100) {
    scale = 70
  }

  return this._generateFileURL(file)
    .then(url => {
      url1 = url
      return this._file2Image(url)
    })
    .then(image => this._drawImage(image, type, quality, scale))
    .then(blob => {
      let result = null

      // 释放url的内存
      this.URL && this.URL.revokeObjectURL(url1)
      if (blob && blob.size < file.size) {
          let date = new Date()
          blob.lastModified = date.getTime()
          blob.lastModifiedDate = date
          blob.name = file.name
          result = blob
      } else {
        result = file
      }

      return result
    })
    .catch(error => {
      // 释放url的内存
      this.URL && this.URL.revokeObjectURL(url1)
      throw error
    })
}

export default IQO
