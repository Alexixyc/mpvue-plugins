<template>
    <div class="clip">
        <div class="clip-main">
            <div class="clip-mask"
                @touchstart="imgTouchStart"
                @touchmove="imgTouchMove"
                @touchend="imgTouchEnd">
                <!-- 利用border制作的中间透明的蒙层 -->
            </div>
            <div class="clip-area">
                <!-- 用于衡量剪裁范围的隐形框框 -->
                <span class="l t"></span>
                <span class="r t"></span>
                <span class="r b"></span>
                <span class="l b"></span>
            </div>
            <img
                class="clip-img"
                :src="clipImage.filePath"
                :style="{
                    'width':clipImage.currentW + 'px',
                    'height':clipImage.currentH + 'px',
                    'left':clipImage.currentX + 'px',
                    'top':clipImage.currentY + 'px'
                }">
        </div>
        <div class="clip-btns">
            <span @click="chooseImage">重新选择</span>
            <span @click="confirmClip">确定</span>
        </div>
        <canvas canvas-id="clipBox"
            :style="{
                'position': 'fixed',
                'top': '200%',
                'width': clipImage.width + 'px',
                'height': clipImage.height + 'px'
                }">
        </canvas>
    </div>
</template>
<script>
import { ClipImage } from './clip.js'
export default {
    name: 'ax-clipper',
    props: {
        imgPath: {
            require: true,
            type: [String]
        }
    },
    data() {
        return {
            clipImage: {} // Object ClipImage
        }
    },
    watch: {
        imgPath(newVal) {
            this.initImgClipping()
        }
    },
    methods: {
        // 初始化处理待剪裁的原始图片的信息
        initImgClipping() {
            // 如果传入的图片是网路图片需要先下载, 本地上传或拍张不能下载
            wx.getImageInfo({
                src: this.imgPath,
                success: res => {
                    wx.createSelectorQuery().select('.clip-area').boundingClientRect(rect => {
                        ClipImage.prototype.clipArea = rect // 剪裁区域
                        this.clipImage = new ClipImage({
                            fileWidth: res.width,
                            fileHeight: res.height,
                            filePath: res.path
                        })
                    }).exec()
                },
                fail: error => {
                    console.log(error)
                }
            })
        },
        // touchstart
        imgTouchStart(e) {
            if (e.mp.touches.length > 2) return
            this.clipImage.touchstart(e.mp.touches)
        },
        // mosuemove
        imgTouchMove(e) {
            if (this.clipImage.touches.length === 1) {
                // 单纯的移动
                let pointX = e.mp.touches[0].clientX - this.clipImage.touches[0].clientX + this.clipImage.left
                let pointY = e.mp.touches[0].clientY - this.clipImage.touches[0].clientY + this.clipImage.top
                this.clipImage.moveToPoint(pointX, pointY)
            } else if (this.clipImage.touches.length === 2 && e.mp.touches.length === 2) {
                // 缩放 触摸点 >= 2取前两个
                let gapBefore = {
                    gapX: Math.abs(this.clipImage.touches[0].clientX - this.clipImage.touches[1].clientX),
                    gapY: Math.abs(this.clipImage.touches[0].clientY - this.clipImage.touches[1].clientY)
                }
                let gapIng = {
                    gapX: Math.abs(e.mp.touches[0].clientX - e.mp.touches[1].clientX),
                    gapY: Math.abs(e.mp.touches[0].clientY - e.mp.touches[1].clientY),
                    originX: parseInt((e.mp.touches[1].clientX + e.mp.touches[0].clientX) / 2) - this.clipImage.left, // 相对于图，基准点x
                    originY: parseInt((e.mp.touches[1].clientY + e.mp.touches[0].clientY) / 2) - this.clipImage.top// 相对于图，基准点y
                }
                gapBefore.gap = parseInt(Math.sqrt(Math.pow(gapBefore.gapX, 2) + Math.pow(gapBefore.gapY, 2)))
                gapIng.gap = parseInt(Math.sqrt(Math.pow(gapIng.gapX, 2) + Math.pow(gapIng.gapY, 2)))
                let scale = parseFloat((gapIng.gap / gapBefore.gap).toFixed(2))
                this.clipImage.fnScale(scale, gapIng.originX, gapIng.originY)
            }
        },
        // touchend
        imgTouchEnd(e) {
            this.clipImage.moveEnd(e.mp.changedTouches[0])
        },
        // 确认剪裁
        confirmClip() {
            const ctx = wx.createCanvasContext('clipBox')
            ctx.drawImage(this.imgPath, 0, 0, this.clipImage.width, this.clipImage.height)
            ctx.draw(false, () => {
                wx.canvasToTempFilePath({
                    x: this.clipImage.clipArea.left - this.clipImage.left,
                    y: this.clipImage.clipArea.top - this.clipImage.top,
                    width: this.clipImage.clipArea.width,
                    height: this.clipImage.clipArea.height,
                    canvasId: 'clipBox',
                    success: res => {
                        this.$emit('success', res.tempFilePath)
                    },
                    fail: err => {
                        console.log(err)
                    }
                })
            })
        },
        // 重新选择
        chooseImage() {
            this.$emit('chooseImage')
        }
    },
    mounted() {
        this.initImgClipping()
    }
}
</script>
<style lang="less" scoped src="./style.css"></style>
