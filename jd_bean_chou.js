/*
****************************
new Env('京东每日抽奖京豆')
****************************
【 脚本每日8点10分执行一次 】
cron:10 8 * * *
更新时间: 2023.03.22
如果转载: 请注明出处
****************************/
const cryptoJS = require('crypto-js')
require("./lib/user").jd_user('京东每日抽奖京豆', async (user) => {
    /*以下是活动函数*/
    await chouJdBean(user)     // 抽奖京豆
    console.log(user.getLogs())
})

async function chouJdBean(user){
    const taskName = "【抽奖京豆】"
    const [functionId, params] = getParams()
    const sv = getSv ()
    const t =  Date.now()
    const uuid = getUUID(functionId, params, t) 
    const sign = getSign(functionId, params, uuid, t, sv)
    const options = {
        "url": `https://api.m.jd.com/client.action?functionId=${functionId}`,
        "body": `body=${encodeURIComponent(params)}&client=android&clientVersion=11.2.2&uuid=${uuid}&st=${t}&sign=${sign}&sv=${sv}`,
    }
    
    const data = await user.post(options).json()
    if (data.prizeName) {
        user.log(`🟢${taskName}获得${data.prizeName}`)
    }else{
        user.log(`🟡${taskName}${data.promptMsg || data.responseMessage || data.echo}`)
    }
}

function getParams() {
    const params = JSON.stringify({
        "enAwardK": 'ltvTJ/WYFPZcuWIWHCAjRwJKpRybAaRzoT6GAemMh8e7DDzXHNt5Br7i6hYH2826ssuKfHev2yv28HWSugMPNJj0hO0oRf9K9vB1kroDDzT5uSUPG/Z35YJDHw8AyYmqk4Q1u2vSGKS/M+5ruJeepDDbGjIC3nIIbIE2I7/kWfG6LEOpCsfjzQD+tTlmq6znidq4bRZoUJ3MOg0BXga8nlydG49V38/2izTyoZbMHAIV+/rRIADZUGz6JHdG+Yw67BTFOL7W9o1/QxMJXh0i01j9BFd4NxlYYV1Y1lmREWuq5MfaiBCjgTgBs5QR2JMLJJxoKaU1ylxX/pA7ODI5Oq1MBImP3FWzKZ8usMHuDNBpV1H5DIrRz4ht3CDOAN2Q_babel',
        "awardSource": "1",
        "srv": '{"bord":"0","fno":"0-0-2","mid":"86959864","bi2":"2","bid":"0","aid":"01378571"}',
        "encryptProjectId": '27tkYWkyNJ77CVV9vt1T1y1kjJjK',
        "encryptAssignmentId": 'GbJa5egPpPZycufBGWSQzxaCVUo',
        "authType": "2",
        "riskParam": {
          "platform": "3",
          "orgType": "2",
          "openId": "-1",
          "pageClickKey": 'Babel_WheelSurf',
          "eid": "",
          "fp": "-1",
          "shshshfp": "",
          "shshshfpa": "",
          "shshshfpb": "",
          "childActivityUrl": 'https://pro.m.jd.com/mall/active/34LkGAbTkH9L3bF3dAK3pK2AYJh4/index.html?babelChannel=ttt3&tttparams=36m4Z77qeyJhZGRyZXNzSWQiOjQ1NzUwOTUxMjgsImRMYXQiOjAsImRMbmciOjAsImdMYXQiOiIzMS4xMzg3OCIsImdMbmciOiIxMjEuNDIzODEzIiwiZ3BzX2FyZWEiOiIyXzI4MTNfNjExMzBfMCIsImxhdCI6MzEuMTM4ODE4LCJsbmciOjEyMS40MjM3MjIsIm1vZGVsIjoiMjIwMjEyMTFSQyIsInBvc0xhdCI6IjMxLjEzODc4IiwicG9zTG5nIjoiMTIxLjQyMzgxMyIsInByc3RhdGUiOiIwIiwidW5fYXJlYSI6IjJfMjgxM182MTEzMF8wIn80%3D',
          "userArea": "-1",
          "client": "",
          "clientVersion": "",
          "uuid": "",
          "osVersion": "",
          "brand": "",
          "model": "",
          "networkType": "",
          "jda": "-1"
        },
        "siteClient": 'android',
        "mitemAddrId": "",
        "addressId": "",
        "posLng": "",
        "posLat": "",
        "un_area": "",
        "gps_area": "",
        "homeLng": "",
        "homeLat": "",
        "homeCityLng": 0,
        "homeCityLat": 0,
        "focus": "",
        "innerAnchor": "",
        "cv": '2.0'
    })
    const functionId = 'babelGetLottery'
    return [functionId, params]
}

function getUUID(functionId, params, times){
    const len = functionId.length+params.length
    const st = cryptoJS.MD5(times).toString().substring(0, 30-(len % 8))
    // console.log(st, st.length)
    return st
}

function getSign(functionId, params, uuid, t, sv){
    const body = `functionId=${functionId}&body=${params}&uuid=${uuid}&client=android&clientVersion=11.2.2&st=${t}&sv=${sv}`
    const arr = Array.from({length: 1721}).map(_ => 0)
    const arr_iv = [55, 146, 68, 104, 165, 61, 204, 127, 187, 15, 217, 136, 238, 154, 233, 90]
    let p0 = "80306f4370b39fd5630ad0529f77adb6", p1, p2, p3
    for (i in arr) {
        p1 = body.charCodeAt(i)
        p2 = p0.charCodeAt((i & 7))
        p3 = arr_iv[(i & 15)]
        p1 = (p3 ^ p1 ^ p2) + p3
        p3 = (p3 ^ p1 ^ p2 & 255)
        arr[i] = p3
    }
    const sign = new Buffer.from(arr).toString('base64')
    return cryptoJS.MD5(sign).toString()
}

function getSv () {
    const sv_arr = [
        [0, 2],[2, 0],[1, 1]
        /* [0, 0],[1, 2],[2, 1] */
    ]
    let [a, b] = sv_arr[Math.floor(Math.random()*sv_arr.length)]
    return '1' + a + b
}