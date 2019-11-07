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

