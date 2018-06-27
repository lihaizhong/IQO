/**
 * @author sky
 * @email 854323752@qq.com
 * @create date 2018-06-25 05:00:10
 * @modify date 2018-06-25 05:00:10
 * @desc 图片质量优化（Image Quality Optimize）
*/

import 'blueimp-canvas-to-blob'

export default class IQO {
  constructor (standard) {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    if (!window.URL) {
      window.URL = window.webkitURL || window.mozURL
    }

    if (!isNaN(standard) && standard > 0) {
      this.standard = standard
    } else {
      this.standard = 600
    }
  }

  _file2Image (url) {
    return new Promise((resolve, reject) => {
      let image = new Image()

      image.onload = () => resolve(image)
      image.onerror = (error) => reject(error)
      image.src = url
    })
  }

  // 测试结果：在图片质量调至45、原图宽高在1000左右的情况下，图片大小下降近5倍
  _drawImage (image, type, quality, scale) {
    return new Promise(resolve => {
      // Optimize: 缩小体积以减小图片大小
      if (image.width < this.standard && image.height < this.standard) {
        scale = 1
      }

      let width = image.width * scale / 100
      let height = image.height * scale / 100

      this.canvas.width = width
      this.canvas.height = height
      // 在canvas中绘制图片
      this.ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height)
      // 将图片转换成Blob对象
      this.canvas.toBlob(
        // Optimize: 改变图片质量以减小图片体积
        (blob) => resolve(blob), type, quality / 100)
    })
  }

  compress (file, quality, scale) {
    let type = file.type || 'image/' + file.substr(file.lastIndexOf('.') + 1)

    quality = Number(quality)
    if (isNaN(quality) || quality < 0 || quality > 100) {
      quality = 95
    }

    scale = Number(scale)
    if (isNaN(scale) || scale < 0 || scale > 100) {
      scale = 70
    }

    let url = window.URL.createObjectURL(file)
    return this._file2Image(url)
      .then((image) => {
        return this._drawImage(image, type, quality, scale)
          .then((blob) => {
            // test(blob, file)
            window.URL.revokeObjectURL(url)
            return blob.size < file.size ? blob : file
          })
          .catch((error) => {
            window.URL.revokeObjectURL(url)
            throw error
          })
      })
      .catch((error) => {
        window.URL.revokeObjectURL(url)
        throw error
      })
  }
}