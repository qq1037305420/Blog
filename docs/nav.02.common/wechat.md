---
title: 微信相关
---
## 获取openId

```js
// redirect_url 需要在微信公众号中配置授权域名。不需要用户点授权按钮即可获取
// Code作为url参数返回（有效期5分钟只一次管用）
https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_url}&response_type=code&scope=snsapi_base#wechat_redirect

// 通过get下面接口可获得openId（建议全局缓存，如果没有再取。access_token每天只能获取2000次）
// code: 081GMBzi2L8dqB0YTjBi2INMzi2GMBz9
// 该接口跨域不支持jsonp 需要转发处理
https://api.weixin.qq.com/sns/oauth2/access_token?appid==${appid}&secret==${appsecret}&code=081GMBzi2L8dqB0YTjBi2INMzi2GMBz9&grant_type=authorization_code

{
    "access_token": "24_IjjAB90m9v7vfS8zfqRPZ2xcrF8oKrAlJ2HwDRPfwS0mKnaa2qAbBmULOyf1jTJgP08g97rbPAKktH7v-KjIHA",
    "expires_in": 7200,
    "refresh_token": "24_cItvVazfzYbzmDS_5dD7JKcqn5fP_-oY6V70eHHGaDEsSu8c43rpSGkzHb26rsiLttYgvzPJMFxe1jdB0S3rzQ",
    "openid": "oS0TU0gfzxepJDtH5qwsMAEfLhDA", *******
    "scope": "snsapi_base"
}
```

## jssdk封装
```js
import axios from 'axios'
import wx from 'weixin-js-sdk'
import Env from './env'

interface getLocationCallback { latitude: number, longitude: number, speed: number, accuracy: number }
interface openLocationOption {
    latitude: number // 纬度，浮点数，范围为90 ~ -90
    longitude: number // 经度，浮点数，范围为180 ~ -180。
    name: string // 位置名
    address: string // 地址详情说明
}
class WXSdk {
    constructor(jsApiList = ['getLocation', 'openLocation', 'chooseImage', 'getLocalImage', 'uploadImage', 'translateVoice', 'startRecord', 'stopRecord'], url = document.location) {
        axios.get(`${Env.DATA_SERVER}/weixin/signature?url=${url}`).then(response => {
            let {timestamp, nonceStr, signature } = response.data as any
            wx.config(
                debug: !Env.PRODUCTION_MODE, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: Env.WX_APP_ID, // 必填，公众号的唯一标识
                timestamp, // 必填，生成签名的时间戳
                nonceStr, // 必填，生成签名的随机串
                signature, // 必填，签名
                jsApiList: jsApiList // 必填，需要使用的JS接口列表
            })
            wx.error(res => {
                console.error(res)
            })
        })
    }
    public uploadImage(localId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.call('uploadImage', {
                localId: localId,
                isShowProgressTips: 1,
                success: function (res) {
                    resolve(res)
                }
            })
        })
    }
    public chooseImage(): Promise<any> {
        let me = this
        return new Promise((resolve, reject) => {
            me.call('chooseImage', {
                count: 1,
                sizeType: ['compressed'],
                sourceType: ['camera'],
                success: function (res) {
                    resolve(res.localIds)
                }
            })
        })
    }
    public getLocalImage(localId: string): Promise<string> {
        return new Promise((resolve, reject) => {
            wx.getLocalImgData({
                localId: localId, // 图片的localID
                success: function (res) {
                    resolve(res.localData) // localData是图片的base64数据，可以用img标签显示
                }
            });
        })
    }
    public getLocation(): Promise<getLocationCallback> {
        return new Promise<getLocationCallback>((resolve, rejct) => {
            this.call('getLocation', {
                type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                success: function (res) {
                    resolve(res as any)
                }
            })
        })
    }
    public openLocation(params: openLocationOption): void {
        this.call('openLocation', params)
    }
    public startRecord(): void {
        this.call('startRecord')
    }
    public async stopNTranslate(): Promise<string> {
        let voiceId = await this.stopRecord()
        return await this.translateVoice(voiceId)
    }
    private stopRecord(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.call('stopRecord', {
                success: function (res) {
                    var localId = res.localId;
                    resolve(localId)
                }
            })
        })
    }
    private translateVoice(localId: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.call('translateVoice', {
                localId: localId, // 需要识别的音频的本地Id，由录音相关接口获得
                isShowProgressTips: 1, // 默认为1，显示进度提示
                success: function (res) {
                    resolve(res.translateResult); // 语音识别的结果
                }
            })
        })
    }
    private call(methodName: string, methodParams?: any) {
        wx.ready(() => {
            wx[methodName].call({}, methodParams)
        })
    }
}

export default new WXSdk()
// 因为基于底层的webview有限制，ios的拍照实现需要用提供的方法转成base64
// hmmmm, 这个好坑啊
// 详见 https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/iOS_WKWebview.html
export function isIos(): boolean {
    var u = navigator.userAgent;
    let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; // android终端
    // var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); // ios终端
    if (!isAndroid) {
        return true
    } else {
        return false
    }
}

```