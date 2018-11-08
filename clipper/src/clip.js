/*
 * @Author: AlexiXiang
 * @Date: 2018-11-01 10:36:01
 * @LastEditors: AlexiXiang
 * @LastEditTime: 2018-11-07 10:37:01
 * @Description: 剪裁图片
 */
/**
 * 待剪裁的iImage对象
 * @param {*} obj { fileWidth,fileHeight,filePath }
 */
function ClipImage(obj) {
    // 单位统一换算成px, 便于计算
    this.fileWidth = obj.fileWidth // 图片原始宽
    this.fileHeight = obj.fileHeight // 图片原始高
    this.filePath = obj.filePath // 图片路径
    this.ratioWH = (this.fileWidth / this.fileHeight).toFixed(3) // 图片宽：高比例
    this.touches = [] // 当前屏幕触摸点
    this.scale = 1 // 图片的放缩比例
    if (this.ratioWH >= 1) {
        // 宽 > 高：初始化高 = 剪裁区域的高
        this.height = this.clipArea.height // img初始高度（px）
        this.width = Math.round(this.height * this.ratioWH) // img初始宽度（px）
        this.top = this.clipArea.top // 图片距顶像素（px）
        this.left = this.clipArea.left + parseFloat(((this.clipArea.width - this.width) / 2).toFixed(1)) // 图片距左像素（px）
    } else {
        // 高 > 宽：初始化宽 = 剪裁区域的宽
        this.width = this.clipArea.width // img初始宽度（px）
        this.height = Math.round(this.width / this.ratioWH) // img初始高度（px）
        this.top = this.clipArea.top + parseFloat(((this.clipArea.height - this.height) / 2).toFixed(1)) // 图片距顶像素（px）
        this.left = this.clipArea.left // 图片距左像素（px）
    }
    this.initW = this.width // 图片的初始宽
    this.initH = this.height // 图片的初始高
    this.initX = this.left // 图片初始left
    this.initY = this.top // 图片初始top
    this.currentW = this.width // 图片在变换中的宽度
    this.currentH = this.height // 图片在变换中的高度
    this.currentX = this.left // 图片在变换中的left
    this.currentY = this.top // 图片在变换中的top
    this.currentScale = this.scale // 图片在变换中的scale

    // touchstart事件：传入当前触摸点对象集合
    this.touchstart = (touchObjs) => {
        if (touchObjs.length === 1) {
            this.deleteTouch()
            this.addTouch(touchObjs[0])
        } else if (touchObjs.length === 2 && this.touches.length === 1) {
            this.addTouch(touchObjs[1])
        }
    }

    // move事件：传入目的点的坐标（left, top）
    this.moveToPoint = (left, top, currentScale) => {
        if (currentScale === 3 || currentScale === 1) {
            return
        }
        // 超出左边界
        if (left >= this.clipArea.left) {
            left = this.clipArea.left
        }
        // 超出右边界
        if (left <= this.clipArea.left + this.clipArea.width - this.currentW) {
            left = this.clipArea.left + this.clipArea.width - this.currentW
        }
        // 超出上边界
        if (top >= this.clipArea.top) {
            top = this.clipArea.top
        }
        // 超出下边界
        if (top <= this.clipArea.top + this.clipArea.height - this.currentH) {
            top = this.clipArea.top + this.clipArea.height - this.currentH
        }
        this.currentX = left
        this.currentY = top
    }

    // scale事件：缩放事件scale：本次缩放相对于上次缩放结束时，的缩放比例
    this.fnScale = (scale, originX, originY) => {
        // 此次缩放相对于初始宽高的比例
        this.currentScale = parseFloat((this.scale + (scale - 1)).toFixed(2))
        if (this.currentScale <= 1) {
            this.currentScale = 1
        }
        if (this.currentScale >= 3) {
            this.currentScale = 3
        }
        // 缩放一初始位置为基准
        this.currentW = Math.round(this.currentScale * this.initW)
        this.currentH = Math.round(this.currentScale * this.initH)
        // move以上一次位置为基准
        this.moveToPoint(parseInt(this.left - (scale - 1) * originX), parseInt(this.top - (scale - 1) * originY), this.currentScale)
        // move以中心点为基准
        // this.moveToPoint(parseInt(this.initX - (this.currentScale - 1) * 0.5 * this.initW), parseInt(this.initY - (this.currentScale - 1) * 0.5 * this.initH))
    }

    // 移动结束
    this.moveEnd = (touchObj) => { // move结束
        this.left = this.currentX
        this.top = this.currentY
        this.width = this.currentW
        this.height = this.currentH
        this.scale = this.currentScale
        // 从touches数组中删除当前触摸点
        this.deleteTouch(touchObj)
    }

    // 添加一个触摸点
    this.addTouch = (touchObj) => {
        if (touchObj.hasOwnProperty('identifier')) {
            this.touches.push(new Touch(touchObj))
        }
    }

    // 删除一个触摸点
    this.deleteTouch = (touchObj) => {
        if (touchObj) {
            this.touches = this.touches.filter((item, index) => {
                return item.identifier != touchObj.identifier
            })
        } else {
            this.touches = []
        }
    }
}

/**
 * 触摸点对象
 * @param {*} obj
 */
function Touch(option) {
    for (const key in option) {
        if (option.hasOwnProperty(key)) {
            this[key] = option[key]
        }
    }
}

export { ClipImage }
