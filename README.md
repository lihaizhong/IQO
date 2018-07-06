# IQO

图片压缩

## Install

```bash
# npm 安装
npm install iqo --save-dev 或者 npm i iqo -D
# yarn 安装
yarn add iqo --save-dev
```

## Usage

**注意：**如果是使用webpack打包，建议使用`dist/iqo.es.js`.

webpack配置:

```javascript
module.exports = {
  ...,
  resolve: {
    alias: {
      'iqo$': 'iqo/dist/iqo.es.js'
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
iqo.compress(file, quality, scale)
  .then(newfile => {
    console.log(file.size, newfile.size)
  })
```
