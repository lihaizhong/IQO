# IQO

图片压缩

## Usage

```javascript
import IQO from 'iqo'

let file = xxx
let quality = 55
let scale = 60
let iqo = new IQO() // 默认压缩有图片最大是600 * 600，如果有自定义需求，可以自己修改 new IQO(standard = 600)
let newfile = iqo.compress(file, quality, scale)

console.log(file.size, newfile.size)
```
