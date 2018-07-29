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
  if ('URL' in window) {
    this.URL = window.URL
  } else if ('webkitURL' in window) {
    this.URL = window.webkitURL
  } else if ('mozURL' in window) {
    this.URL = window.mozURL
  } else if ('msURL' in window) {
    this.URL = window.msURL
  } else {
    this.URL = null
  }
}

internal._generateFileURLByURL = function (file) {
  // console.log('使用window.URL生成URL')
  return this.URL.createObjectURL(file)
}

internal._generateFileURLByFileReader = function (file, success, fail) {
  // console.log('使用FileReader生成URL')
  let fileReader = new FileReader()

  fileReader.onload = function () {
    success(fileReader.result)
  }

  fileReader.onerror = function (error) {
    // console.log('FileReader读取文件失败')
    fail(error)
  }

  fileReader.readAsDataURL(file)
}

/**
 * 文件类型转换为url
 * @param {file}} file
 */
internal._generateFileURL = function (file) {
  return new Promise((resolve, reject) => {
    // console.log('将文件类型转换成URL')
    if (this.URL) {
      resolve(this._generateFileURLByURL(file))
    } else if ('FileReader' in window) {
      this._generateFileURLByFileReader(file, function (url) {
        resolve(url)
      }, function (error) {
        reject(error)
      })
    } else {
      // console.log('您的浏览器不支持window.URL和FileReader！')
      reject(new Error('您的浏览器不支持window.URL和FileReader！'))
    }
  })
}

internal._revokeFileURL = function (url) {
  this.URL && this.URL.revokeObjectURL(url)
}

/**
 * 文件类型转换为图片类型
 * @param {base64} url
 */
internal._file2Image = function (url) {
  return new Promise((resolve, reject) => {
    console.log('加载图片')
    let image = new Image()

    image.onload = () => resolve(image)
    image.onerror = (error) => {
      console.log(this.prefix + '图片加载失败！', error)
      reject(error)
    }

    image.src = url
  })
}

/**
 * 获取到canvas每一个像素，然后检查这张图片是否是黑色的图片
 * 注：不对黑色的图片进行压缩
 * @param {array} imageData 
 */
// internal._checkImageData = function (imageData) {
//   let len = imageData ? imageData.length : 0
//   let otherData = 0

//   if (len) {
//     for (let i = 0; i < len; i += 4) {
//       let r = imageData[i]
//       let g = imageData[i + 1]
//       let b = imageData[i + 2]

//       if (r !== 0 && g !== 0 && b !== 0) {
//         otherData++
//       }
//     }
//   }

//   return otherData !== 0
// }

/**
 * 图片绘制，压缩
 * @param {image} image
 * @param {string} type
 * @param {number} quality
 * @param {number} scale
 */
internal._drawImage = function (image, type, quality, scale) {
  return new Promise((resolve, reject) => {
    // console.log('开始画图')
    // OPTIMIZE: 缩小体积以减小图片大小
    scale = image.width < this.standard && image.height < this.standard ? 1 : scale / 100
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

    $$canvas.setAttribute('width', width)
    $$canvas.setAttribute('height', height)
    $$canvas.width = width
    $$canvas.height = height

    // console.log('是否支持toBlob：' + (typeof $$canvas.toBlob === 'function'))
    try {
      // 完成blob对象的回调函数
      let done = (blob) => resolve(blob)
      // 1. 清除画布
      ctx.clearRect(0, 0, width, height)
      ctx.save()
      // 2. 在canvas中绘制图片
      ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height)
      ctx.restore()
      // let imageData = ctx.getImageData(0, 0, width, height)
      // if (!this._checkImageData(imageData)) {
      //   reject(new Error('不对全黑图片进行压缩操作！'))
      //   return
      // }
      // 4. 将图片转换成base64
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
      this._revokeFileURL(url1)
      if (blob && blob.size < file.size) {
        let date = new Date()
        blob.lastModified = date.getTime()
        blob.lastModifiedDate = date
        blob.name = file.name
        result = blob
      } else {
        result = file
      }
      // console.log(Object.prototype.toString.call(result))

      return result
    })
    .catch(error => {
      // 释放url的内存
      this._revokeFileURL(url1)
      // console.log('文件压缩失败！', error)
      console.error(error)
      return file
    })
}

export default IQO
