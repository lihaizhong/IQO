/**
 * @author sky
 * @email 854323752@qq.com
 * @create date 2018-06-25 05:00:10
 * @modify date 2018-06-25 05:00:10
 * @desc 图片质量优化（Image Quality Optimize）
 */

import dataURLtoBlob from 'blueimp-canvas-to-blob'

/**
 * 构造函数
 * @param {Number} standard 基准值，表示是否需要进行图片缩放操作。默认：600
 */
function IQO(standard) {
  this.prefix = '[IQO]'
  this.standard = !isNaN(standard) && standard > 0 ? standard : 600
  this.URL = this._URLCompat()
}

const internal = (IQO.prototype = {
  constructor: IQO
})

/**
 * 兼容的url生成器
 */
internal._URLCompat = function() {
  if ('URL' in window && typeof window.URL.createObjectURL === 'function') {
    return window.URL
  } else if ('webkitURL' in window) {
    return window.webkitURL
  } else if ('mozURL' in window) {
    return window.mozURL
  } else if ('msURL' in window) {
    return window.msURL
  }

  return null
}

/**
 * 通过window.URL生成文件url
 * @param {file} file
 */
internal._generateFileURLByURL = function(file) {
  return this.URL.createObjectURL(file)
}

/**
 * 通过FileReader类生成文件url
 */
internal._generateFileURLByFileReader = function(file, success, fail) {
  let fileReader = new FileReader()

  fileReader.onload = function() {
    success(fileReader.result)
  }

  fileReader.onerror = fail

  fileReader.readAsDataURL(file)
}

/**
 * 生成文件url
 * @param {file}} file
 */
internal._generateFileURL = function(file) {
  return new Promise((resolve, reject) => {
    if (this.URL) {
      resolve(this._generateFileURLByURL(file))
    } else if ('FileReader' in window) {
      this._generateFileURLByFileReader(file, resolve, reject)
    } else {
      reject(new Error('您的浏览器不支持window.URL和FileReader！'))
    }
  })
}

/**
 * 注销文件url
 * @param {string} url
 */
internal._revokeFileURL = function(url) {
  this.URL && this.URL.revokeObjectURL(url)
}

/**
 * 文件类型转换为图片类型
 * @param {base64} url
 */
internal._file2Image = function(url) {
  return new Promise((resolve, reject) => {
    let image = new Image()

    image.onload = () => resolve(image)
    image.onerror = error => {
      console.error(this.prefix + '图片加载失败！', error)
      reject(error)
    }

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
internal._drawImage = function(image, type, quality, scale) {
  return new Promise((resolve, reject) => {
    // OPTIMIZE: 缩小体积以减小图片大小
    scale =
      image.width < this.standard && image.height < this.standard
        ? 1
        : scale / 100
    // OPTIMIZE: 减少质量以减小图片大小
    quality = quality / 100

    if (!this.canvas) {
      this.canvas = document.createElement('canvas')
      this.ctx = this.canvas.getContext('2d')
    }

    let $$canvas = this.canvas
    let ctx = this.ctx

    let width = image.width * scale
    let height = image.height * scale

    // 设置canvas的尺寸
    $$canvas.setAttribute('width', width)
    $$canvas.setAttribute('height', height)
    $$canvas.width = width
    $$canvas.height = height

    try {
      // 1. 清除画布
      ctx.clearRect(0, 0, width, height)
      ctx.save()
      // 2. 在canvas中绘制图片
      ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height)
      ctx.restore()
      // 4. 将图片转换成base64
      // NOTE: quality属性只有jpg和webp格式才有效
      if ($$canvas.toBlob) {
        $$canvas.toBlob(resolve, type, quality)
      } else {
        resolve(dataURLtoBlob($$canvas.toDataURL(type, quality)))
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
IQO.prototype.compress = function(file, quality, scale) {
  let type = file.type || 'image/' + file.substr(file.lastIndexOf('.') + 1)
  let generatedUrl = null

  quality = Number(quality)
  if (isNaN(quality) || quality <= 0 || quality > 100) {
    quality = 70
  }

  scale = Number(scale)
  if (isNaN(scale) || scale <= 0 || scale > 100) {
    scale = 70
  }

  return this._generateFileURL(file)
    .then(url => this._file2Image((generatedUrl = url)))
    .then(image => this._drawImage(image, type, quality, scale))
    .then(blob => {
      // 适配结果图片
      if (blob && blob.size > 0 && blob.size < file.size) {
        const date = new Date()
        blob.lastModified = date.getTime()
        blob.lastModifiedDate = date
        blob.name = file.name
        return blob
      }

      return file
    })
    .catch(error => {
      console.error(error)
      return file
    })
    .then(finalFile => {
      // 释放url的内存
      this._revokeFileURL(generatedUrl)
      return finalFile
    })
}

export default IQO
