/*
****************************
new Env('京东微信签到')
****************************
【 脚本每日6点执行一次 】
cron:1 6 * * *
更新时间: 2023.03.27
如果转载: 请注明出处
****************************/
const crypto = require("crypto-js")
const df = require("date-fns")
require("./lib/user").jd_user('京东微信签到', async (user) => {
    /*以下是活动函数*/
    await supermarkSign(user)        // 京东超市入口：京东app->首页-京东超市
    console.log(user.getLogs())
})


async function supermarkSign(user) {
    const taskName = "【超市领红包】"
    const appId = "9a38a"
    const functionId = "SignComponent_doSignTask"
    const body = `{'activityId': '10004'}`
    const { fp, tk, algo } = await request_algo(appId, user)
    if (fp) {
        const h5st = build_h5st(functionId, crypto.SHA256(body).toString(), fp, tk, algo, appId)
        let options = {
            "url": `https://api.m.jd.com/signTask/doSignTask?functionId=${functionId}&appid=hot_channel&loginWQBiz=signcomponent&loginType=2&body=${body}&h5st=${encodeURIComponent(h5st)}`,
            "headers": {
                "referer": "https://servicewechat.com/wx91d27dbf599dff74/616/page-frame.html",
            }
        }
        let resp = await user.post(options).json()
        if (resp?.subCode == 0) {
            const { signDays, rewardValue } = resp.data
            user.log(`🟢${taskName}签到: ${signDays}天, 获得红包: ${rewardValue}元`)
        } else {
            user.log(`🟡${taskName}${resp.errorMessage || resp.message || resp.msg || JSON.stringify(resp)}`)
        }
    } else{
        user.log(`🔴${taskName}获取加密参数异常`) 
    }
}

async function request_algo(appId, user) {
    const fp = build_fp()
    const options = {
        url: "https://cactus.jd.com/request_algo?g_ty=ajax",
        json: {
            "appId": appId,
            "version": "3.0",
            "fp": fp,
            "timestamp": Date.now(),
            "platform": "web",
            "expandParams": ""
        },
        "headers": { "Content-Type": "application/json", "Referer": "https://cactus.jd.com" }
    }
    const resp = await user.post(options).json()
    if (resp?.data?.result) {
        const { tk, algo } = resp.data.result
        const _algo = new Function("return " + algo)()
        return { fp, tk, algo:_algo }
    } else { return {fp:null} }
}

async function querySignList(fp, tk, algo, user) {
    let options = {
        "url": "https://api.m.jd.com/signTask/querySignList?functionId=SignComponent_querySignList&appid=hot_channel&loginWQBiz=signcomponent&loginType=2&body={\"activityId\":\"10004\"}",
        "headers": {
            "referer": "https://servicewechat.com/wx91d27dbf599dff74/616/page-frame.html",
        }
    }
    let resp = await user.post(options).json()
    if (resp?.subCode == 0 && resp?.data?.scanTaskInfo) {
        const { itemId, scanTaskInfo: { scanAssignmentId } } = resp.data
        const functionId = "SignComponent_doScanTask"
        const body = JSON.stringify({
            "itemId": itemId,
            "scanAssignmentId": scanAssignmentId,
            "activityId": "10004",
            "actionType": 0
        })
        const h5st = build_h5st(functionId, crypto.SHA256(body).toString(), fp, tk, algo)
        options = {
            "url": `https://api.m.jd.com/scanTask/startScanTask?functionId=${functionId}&appid=hot_channel&loginWQBiz=signcomponent&loginType=2&body=${body}&h5st=${encodeURIComponent(h5st)}`,
            "headers": {
                "referer": "https://servicewechat.com/wx91d27dbf599dff74/616/page-frame.html",
            }
        }
        await user.wait(3, 5)
        resp = await user.post(options).json()
        console.log(resp)
        console.log(scanTaskInfo)
    } else {
        user.log(`${taskName}${resp.errorMessage || resp.message || resp.msg || JSON.stringify(resp)}`)
    }
}

function build_fp() {
    const numStr = "0123456789"
    let randomStr1 = ""
    do {
        let tmpstr = getSizeStr({ "size": 1, "num": numStr })
        randomStr1.indexOf(tmpstr) == -1 && (randomStr1 += tmpstr)
    } while (randomStr1.length < 3);

    let randomStr2 = numStr
    for (let i of randomStr1.slice()) {
        randomStr2 = randomStr2.replace(i, "");
    }

    function getSizeStr(param) {
        let size = param.size
        let num = param.num
        let rt = ""
        for (; size--;) rt += num[Math.random() * num.length | 0]
        return rt
    }

    const randomSize = Math.random() * 10 | 0
    const fp = getSizeStr({ "size": randomSize, "num": randomStr2 })
        + randomStr1
        + getSizeStr({ "size": 12 - randomSize, "num": randomStr2 })
        + randomSize
    return fp
}

function build_h5st(functionId, body, fp, tk, algo, appId) {
    const st = Date.now()
    const curtime = df.format(st, "yyyyMMddHHmmssSSS")
    let sign = algo(tk, fp, curtime, appId, crypto).toString(crypto.enc.Hex)

    const params = [
        { "key": "appid", "value": "hot_channel" },
        { "key": "body", "value": body },
        { "key": "functionId", "value": functionId }
    ]
    let queryStr = ""
    params.forEach(({ key, value }) => {
        queryStr += key + ":" + value + "&"
    })
    queryStr = queryStr.slice(0, -1)
    queryStr = crypto.HmacSHA256(queryStr, sign).toString(crypto.enc.Hex)
    sign = [curtime, fp, appId, tk, queryStr, "3.0", st.toString()].join(";")
    return sign
}