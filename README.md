# IQO

图片压缩

## Usage

```javascript
import IQO from 'iqo'

let file = xxx
let quality = 85
let iqo = new IQO() // 默认压缩有图片最大是600 * 600，如果有自定义需求，可以自己修改 new IQO(custome_width, custom_height)
let newfile = iqo.compress(file, quality)

console.log(file.size, newfile.size)
```
