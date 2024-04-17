/*
****************************
new Env('京东账号检测')
****************************
【 脚本每日7点执行一次 】
cron:1 7 * * *
更新时间: 2023.03.21
如果转载: 请注明出处
****************************/
require("./lib/user").jd_user('京东账号检测', async (user)=>{
    /*以下是活动函数*/
    await accountCheck(user)     // 账号检测
    console.log(user.getLogs())
    if (!user.isLogin) {
        await user.sendNotify(`${user.uname}-账号已失效，请重新绑定！`)
    }
})

async function accountCheck(user){
    user.log(`【账号检测】`)
    const options = {
        url: `https://rsp.jd.com/windControl/queryScore/v1?lt=m&an=plus.mobile&stamp=${Date.now()}`,
        headers: {
            "X-Requested-With": "com.jingdong.app.mall",
            "Referer": "https://plus.m.jd.com/rights/windControl",
        }
    }
    const data = await user.get(options).json()
    if (data?.code === "1000" && data?.rs) {
        const {userSynthesizeScore, userDimensionScore, scoreUserInfo} = data.rs
        let levelStatus = "安全"
        if (userSynthesizeScore.level == 'ST' || userDimensionScore.baiScore < 3 || userSynthesizeScore.totalScore < 60) {
            levelStatus = "危险"
        }
        user.log(`账号pin: ${scoreUserInfo.pin}(${scoreUserInfo.realName ? "实名" : "未实名"})`)
        user.log(`账号等级: ${levelStatus}${userSynthesizeScore.level}`)
        user.log(`综合得分: ${userSynthesizeScore.totalScore}`)
        user.log(`维度得分: ${userDimensionScore.baiScore}`)
    }else{
        user.isLogin = false
        user.log(`${user.uname}-账号已失效，请重新绑定！`)
        const {getEnvByPtPin, DisableCk} = require('./lib/ql')
        const pin = await getEnvByPtPin(user.uname)
        if (pin?.id) {
            await DisableCk(pin.id)
            user.log(`${user.uname}-账号已在朱雀面板被禁用`)
        }
    }
}