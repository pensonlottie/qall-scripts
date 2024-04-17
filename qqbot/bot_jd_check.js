require("../lib/user").jd_cookies('京东账号检测', async (cookies, User)=>{
    for (const cookie of cookies) {
        const user = new User({cookie})
        /*以下是活动函数*/
        await Promise.all([
            queyrScoe(user)     // 查询账号是否黑号
        ])
        const msg = user.isLogin ? user.getLogs() : `${user.uname}用户已过期`
        console.log(msg)
        await user.sendNotify(msg)
    }
})

async function queyrScoe(user){
    user.log(`【京东账号检测】`)
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
        user.log(`${user.uname}-账号已失效，请重新绑定！`)
    }
}