# IQO

图片压缩

## Usage

**注意：**如果是使用webpack打包，建议使用`dist/index.es.js`.

webpack配置:

```javascript
module.exports = {
  ...,
  resolve: {
    alias: {
      'iqo$': 'iqo/dist/index.es.js'
    }
  }
  ...
}
```

```javascript
import IQO from 'iqo'

let standard = 600 // 默认图片小于 standard * standard时，不进行缩放操作
let file = xxx
let quality = 55 // 只对webp和jpg图片有效，这是canvas决定的
let scale = 60
let iqo = new IQO(standard)
let newfile = iqo.compress(file, quality, scale)

console.log(file.size, newfile.size)
```
