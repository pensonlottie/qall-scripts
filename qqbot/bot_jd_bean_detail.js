require("../lib/user").jd_cookies('获取京豆详情', async (cookies, User)=>{
    for (const cookie of cookies) {
        const user = new User({cookie})
        await Promise.all([
            await getJDUserInfo(user),   // 账号信息
            totalDetailBean(user),       // 京豆详情
            queryexpirejingdou(user)     // 京东过期
        ])
        
        const msg = user.isLogin ? user.getLogs() : `${user.uname}用户已过期`
        console.log(msg)
        await user.sendNotify(msg)
    }
})

async function getJDUserInfo(user) {
    const options = {
        "url": `https://me-api.jd.com/user_new/info/GetJDUserInfoUnion`,
        "headers": {
            "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
        }
    }
    const data = await user.get(options).json()
    if (data?.retcode === '0' && data?.data) {
        const nickName = user.nickName = data.data.userInfo.baseInfo.nickname
        const beanCount = data.data['assetInfo']['beanNum']
        user.log(`【京豆收入明细】`)
        user.log(`${nickName}：${beanCount}京豆 🐶`)
    }else if (data?.retcode === '1001') {
        user.isLogin = false 
    }
}

async function totalDetailBean(user) {
    //前一天的0:0:0时间戳
    const tm = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000 - (24 * 60 * 60 * 1000)
    // 今天0:0:0时间戳
    const tm1 = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000
    let page = 1, todayArr = []
    do {
        const options = {
            url: `https://api.m.jd.com/client.action?functionId=getJingBeanBalanceDetail`,
            body: `body=${escape(JSON.stringify({"pageSize": "20", "page": page.toString()}))}&appid=ld`,
        }
        const data = await user.post(options).json()
        page++
        // console.log(`第${page}页: ${JSON.stringify(data)}`)
        if (data?.code === "0" && data?.detailList) {
          let detailList = data.detailList
          for (let item of detailList) {
            const date = item.date.replace(/-/g, '/') + "+08:00"
            if (new Date(date).getTime() >= tm1 && (!item['eventMassage'].includes("退还") && !item['eventMassage'].includes("物流") && !item['eventMassage'].includes('扣赠'))) {
                todayArr.push(item)
            } else if (tm <= new Date(date).getTime() && new Date(date).getTime() < tm1 && (!item['eventMassage'].includes("退还") && !item['eventMassage'].includes('扣赠'))) {
                //昨日的
                page = null
                break
            }
          }
        } else if (data?.code === "3") {
          user.isLogin = false
          page = null
        } else {
          page = null // console.log(`未知情况，跳出`)
        }
        user.sleep(1)
    } while (page && page < 10)
    /*今日京豆收入*/
    let today_incomebean = 0
    for (let item of todayArr) {
        if (Number(item.amount) > 0) {
            today_incomebean += Number(item.amount)
        }
    }
    user.log(`今日收入总计：${today_incomebean}京豆 🐶`)
    for (let idx in todayArr) {
        if (Number(todayArr[idx].amount) > 0) {
            user.log(`${Number(idx)+1}.${todayArr[idx].eventMassage} ---> ${todayArr[idx].amount}京豆 `)
        }
    }
}


async function queryexpirejingdou(user) {
    const options = {
        url: `https://wq.jd.com/activep3/singjd/queryexpirejingdou?_=${Date.now()}&g_login_type=1&sceneval=2`,
        headers: {
            "Referer": "https://wqs.jd.com/promote/201801/bean/mybean.html",
        }
    }
    let data = await user.get(options).text()
    if (data?.includes('"ret":0')) {
        data = JSON.parse(data.slice(23, -13))
        let expirejingdou = 0
        data?.expirejingdou.map(item => {
            // console.log(`${timeFormat(item['time'] * 1000)}日过期京豆：${item['expireamount']}\n`)
            expirejingdou += item.expireamount
        })
        if (expirejingdou) {
            user.log(`截至今日将过期：${expirejingdou}京豆 🐶`)
        }
    }
}