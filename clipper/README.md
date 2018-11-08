
## 开始
```
npm install ax-clipper --save
```

```html
<template>
    <ax-clipper
        :imgPath="imgPath"
        @chooseImage="chooseImage"
        @success="success">
    </ax-clipper>
</template>
```
```js
import axClipper from 'ax-clipper'
export default {
    components: {
        axClipper
    },
    data() {
        return {
            imgPath: ''
        }
    },
    methods: {
        // 剪裁成功图片
        success(resPath) {
            // resPath：剪裁成功的图片临时路径
            console.log(resPath)
        },
        // 选择图片
        chooseImage() {
            wx.chooseImage({
                count: 1, // 最多可以选择的图片张数，默认9
                sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
                sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
                success: res => {
                    this.imgPath = res.tempFilePaths[0]
                },
                fail: error => {
                    console.log(error)
                }
            })
        }
    }
}
```