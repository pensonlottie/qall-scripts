const cryptoJS = require('crypto-js')
require("../lib/user").jd_cookies('京东资产查询', async (cookies, User)=>{
    for (const cookie of cookies) {
        const user = new User({cookie})
        if(user.qq){
            /*以下是活动函数*/
            await Promise.all([
                await jdaccount(user),   // 账号信息: 用户昵称、会员类型、总京豆
                await totalbean(user),   // 京豆查询: 今日京豆、昨日京豆
                // jscash(user),       // 极速金币: 京东极速版->我的->金币(极速版使用)
                jdzz(user),         // 京东赚赚: 微信->京东赚赚小程序->底部赚好礼->提现无门槛红包(京东使用)
                jdfruit(user),      // 东东农场: 京东->我的->东东农场,完成是京东红包,可以用于京东app的任意商品
                joyruning(user),    // 汪汪赛跑: 京东极速版->首页->中部轮播菜单汪汪赛跑
                jdcash(user),       // 现金提现: 京东->我的->东东萌宠->领现金(微信提现+京东红包)
                redbag(user),       // 红包金额: 京东->我的->我的钱包->红包
                jintie(user),       // 金贴金额: 京东金融->我的->金贴
                gangbeng(user),     // 钢镚金额: 京东金融->我的->钢镚
                phoneFee(user),     // 话费积分: 京东->我的->签到领积分
            ])

            const msg = user.isLogin ? user.getLogs() : `${user.uname}用户已过期`
            console.log(msg)
            await user.sendNotify(msg)
        }
    }
})

async function phoneFee(user) {
    let time = new Date().getTime();
    let encStr = '';
    const encTail = `${time}e9c398ffcb2d4824b4d0a703e38yffdd`;
    encStr = cryptoJS.MD5(encStr + encTail).toString()
    const body =  { "t": time, "encStr": encStr }
    const options = {
        url: `https://dwapp.jd.com/user/dwSignInfo`,
        json: body,
        headers: {
            "Content-Type": "application/json",
            "Referer": "https://mypoint.jd.com/predeem",
        }
    }
    const resp = await user.post(options).json()
   if (resp.code == 200 && resp.data?.totalNum) {
        user.log(`话费积分: ${resp.data.totalNum.toFixed(2)}`)
   } 
}

async function jintie(user){
    const options = {
        url: `https://ms.jr.jd.com/gw/generic/uc/h5/m/mySubsidyBalance`,
        headers: {
            Referer: 'https://active.jd.com/forever/cashback/index?channellv=wojingqb'
        }
    }
    const data = await user.get(options).json()
    if (data?.resultCode == 0) {
        user.log(`金贴金额: ${data.resultData.data.balance || 0}元`)
    }
}

async function gangbeng(user) {
    const options = {
        url: `https://coin.jd.com/m/gb/getBaseInfo.html`,
    }
    const data = await user.get(options).json()
    if (data?.gbBalance) {
        user.log(`钢镚金额:  ${data.gbBalance || 0}元`)
    }
}

async function redbag(user){
    const options = {
        url: `https://api.m.jd.com/client.action?functionId=myhongbao_balance`,
        body: "body=%7B%22fp%22%3A%22-1%22%2C%22appToken%22%3A%22apphongbao_token%22%2C%22childActivityUrl%22%3A%22-1%22%2C%22country%22%3A%22cn%22%2C%22openId%22%3A%22-1%22%2C%22childActivityId%22%3A%22-1%22%2C%22applicantErp%22%3A%22-1%22%2C%22platformId%22%3A%22appHongBao%22%2C%22isRvc%22%3A%22-1%22%2C%22orgType%22%3A%222%22%2C%22activityType%22%3A%221%22%2C%22shshshfpb%22%3A%22-1%22%2C%22platformToken%22%3A%22apphongbao_token%22%2C%22organization%22%3A%22JD%22%2C%22pageClickKey%22%3A%22-1%22%2C%22platform%22%3A%221%22%2C%22eid%22%3A%22-1%22%2C%22appId%22%3A%22appHongBao%22%2C%22childActiveName%22%3A%22-1%22%2C%22shshshfp%22%3A%22-1%22%2C%22jda%22%3A%22-1%22%2C%22extend%22%3A%22-1%22%2C%22shshshfpa%22%3A%22-1%22%2C%22activityArea%22%3A%22-1%22%2C%22childActivityTime%22%3A%22-1%22%7D&client=apple&clientVersion=8.5.0&d_brand=apple&networklibtype=JDNetworkBaseAF&openudid=1fce88cd05c42fe2b054e846f11bdf33f016d676&sign=fdc04c3ab0ee9148f947d24fb087b55d&st=1581245397648&sv=120"
    }
    const data = await user.post(options).json()
    if (data?.resultCode == 200) {
        user.log(`红包金额: ${data.totalBalance || 0}元`)
    }
}

async function joyruning(user) {
    const body = {
        'linkId': 'L-sOanK_5RJCz7I314FpnQ',
        'isFromJoyPark': true,
        'joyLinkId': 'LsQNxL7iWDlXUs6cFl-AAg'
    }
    const options = {
        url: `https://api.m.jd.com/?functionId=runningPageHome&body=${encodeURIComponent(JSON.stringify(body))}&t=${new Date().getTime()}&appid=activities_platform&client=ios&clientVersion=3.9.2`,
        headers: {
            "Referer": "https://h5platform.jd.com/",
        },
    }
    let data = await user.get(options).json()
    if (data?.data?.runningHomeInfo) {
        const joyruning = data.data.runningHomeInfo.prizeValue
        user.log(`汪汪赛跑: ${joyruning || 0}元`)
    }
}

async function jdfruit(user) {
    let body = {
        "version": 14,
        "channel": 1,
        "babelChannel": "120"
    }
    let options = {
        url: `https://api.m.jd.com/client.action?functionId=taskInitForFarm&body=${encodeURIComponent(JSON.stringify(body))}&appid=wh5`,
        headers: {
            "Referer": "https://carry.m.jd.com/",
        }
    }
    let data = await user.get(options).json()
    let totalWaterTaskTimes = 0
    if (data?.totalWaterTaskInit?.totalWaterTaskTimes) {
        totalWaterTaskTimes = data.totalWaterTaskInit.totalWaterTaskTimes
    }
    options = {
        url: `https://api.m.jd.com/client.action?functionId=initForFarm`,
        body: `body=${escape(JSON.stringify({"version":4}))}&appid=wh5&clientVersion=9.1.0`,
        headers: {
            "referer": "https://home.m.jd.com/myJd/newhome.action",
        },
    }
    data = await user.post(options).json()
    if (data?.farmUserPro) {
        let {
            name,
            treeEnergy: num,
            treeTotalEnergy: total,
            totalEnergy: initNum
        } = data.farmUserPro
        const fruit = {
            name,
            rate: (num / total * 100).toFixed(0),
            day: Math.ceil((total - num - initNum) / 10 / (totalWaterTaskTimes||10))
        }
        user.log(`东东农场: ${fruit.name}(${fruit.rate}%,${fruit.day}天)`)
    }
}

async function jdcash(user) {
    const functionId = "cash_homePage"
    const sign = `body=%7B%7D&build=167968&client=apple&clientVersion=10.4.0&d_brand=apple&d_model=iPhone13%2C3&ef=1&eid=eidI25488122a6s9Uqq6qodtQx6rgQhFlHkaE1KqvCRbzRnPZgP/93P%2BzfeY8nyrCw1FMzlQ1pE4X9JdmFEYKWdd1VxutadX0iJ6xedL%2BVBrSHCeDGV1&ep=%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22screen%22%3A%22CJO3CMeyDJCy%22%2C%22osVersion%22%3A%22CJUkDK%3D%3D%22%2C%22openudid%22%3A%22CJSmCWU0DNYnYtS0DtGmCJY0YJcmDwCmYJC0DNHwZNc5ZQU2DJc3Zq%3D%3D%22%2C%22area%22%3A%22CJZpCJCmC180ENcnCv80ENc1EK%3D%3D%22%2C%22uuid%22%3A%22aQf1ZRdxb2r4ovZ1EJZhcxYlVNZSZz09%22%7D%2C%22ts%22%3A1648428189%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D&ext=%7B%22prstate%22%3A%220%22%2C%22pvcStu%22%3A%221%22%7D&isBackground=N&joycious=104&lang=zh_CN&networkType=3g&networklibtype=JDNetworkBaseAF&partner=apple&rfs=0000&scope=11&sign=98c0ea91318ef1313786d86d832f1d4d&st=1648428208392&sv=101&uemps=0-0&uts=0f31TVRjBSv7E8yLFU2g86XnPdLdKKyuazYDek9RnAdkKCbH50GbhlCSab3I2jwM04d75h5qDPiLMTl0I3dvlb3OFGnqX9NrfHUwDOpTEaxACTwWl6n//EOFSpqtKDhg%2BvlR1wAh0RSZ3J87iAf36Ce6nonmQvQAva7GoJM9Nbtdah0dgzXboUL2m5YqrJ1hWoxhCecLcrUWWbHTyAY3Rw%3D%3D`
    const options = {
        url: `https://api.m.jd.com/client.action?functionId=${functionId}`,
        body: sign,
    }
    let data = await user.post(options).json()
    if (data?.data?.result?.totalMoney) {
        const jdcash = data.data.result.totalMoney
        user.log(`现金提现: ${jdcash}元`)
    }
}

async function jdzz(user) {
    const functionId = "interactTaskIndex"
    const body = {}
    const options = {
        url: `https://api.m.jd.com/client.action?functionId=${functionId}&body=${escape(JSON.stringify(body))}&client=wh5&clientVersion=9.1.0`,
        headers: {
            'Referer': 'http://wq.jd.com/wxapp/pages/hd-interaction/index/index',
        }
    }
    let data = await user.get(options).json()
    if (data?.data?.totalNum ) {
        const jdzzNum = data.data.totalNum
        user.log(`京东赚赚: ${jdzzNum}币(≈${(jdzzNum / 10000).toFixed(2)}元)`)
    }
}

async function jscash(user) {
    const functionId = "MyAssetsService.execute"
    const param = {
        "method": "userCashRecord",
        "data": {
            "channel": 1,
            "pageNum": 1,
            "pageSize": 20
        }
    }
    const date = +new Date()
    const st = `lite-android&${JSON.stringify(param)}&android&3.1.0&${functionId}&${date}&846c4c32dae910ef`
    const hs = "12aea658f76e453faf803d15c40a72e0"
    const sign = cryptoJS.HmacSHA256(st, hs).toString()
    const options = {
        url: `https://api.m.jd.com/client.action?functionId=${functionId}&body=${escape(JSON.stringify(param))}&appid=lite-android&client=android&uuid=846c4c32dae910ef&clientVersion=3.1.0&t=${date}&sign=${sign}`,
        headers: {
            'kernelplatform': "RN",
            'User-Agent': "JDMobileLite/3.1.0 (iPad; iOS 14.4; Scale/2.00)",
        }
    }
    let data = await user.get(options).json()
    if (data?.data?.goldBalance) {
        const jscash = data.data.goldBalance
        user.log(`极速金币: ${jscash}币(≈${(jscash / 10000).toFixed(2)}元)`)
    }
}

async function jdaccount(user) {
    const options = {
        "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
        "headers": {
            "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
        }
    }
    const data = await user.post(options).json()
    if (data && data.retcode === 13) {//cookie过期
        user.isLogin = false; 
    }else if (data && data.retcode === 0) {
        user.nickName = data['base'].nickname
        user.log(`【京东资产明细】`)
        user.log(`账户昵称: ${data['base'] && data['base'].nickname}`)
        user.log(`账户信息: Plus会员(${(data['base'] && data['base'].jvalue) || 0}京享)`)
        user.log(`账户京豆: ${(data['base'] && data['base'].jdNum) || 0}豆`)					
    }
}

async function totalbean(user) {
    //前一天的0:0:0时间戳
    const tm = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000 - (24 * 60 * 60 * 1000)
    // 今天0:0:0时间戳
    const tm1 = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000
    let page = 1
    let nextdo = true
    const yesterday_list = [], today_list = []
    do {
        const options = {
            "url": `https://bean.m.jd.com/beanDetail/detail.json?page=${page}`,
            "body": `body=${escape(JSON.stringify({"pageSize": "20", "page": page.toString()}))}&appid=ld`,
        }
        let data = await user.post(options).json()
        if (data?.code === "0") {
            page++
            const detailList = data.jingDetailList
            for (let item of detailList) {
                const date = item.date.replace(/-/g, '/') + "+08:00"
                if (new Date(date).getTime() >= tm1 && (!item['eventMassage'].includes("退还") && !item['eventMassage'].includes("物流") && !item['eventMassage'].includes('扣赠'))) {
                    today_list.push(item)
                } else if (tm <= new Date(date).getTime() && new Date(date).getTime() < tm1 && (!item['eventMassage'].includes("退还") && !item['eventMassage'].includes("物流") && !item['eventMassage'].includes('扣赠'))) {
                    //昨日的
                    yesterday_list.push(item)
                } else if (tm > new Date(date).getTime()) {
                    //前天的
                    nextdo = false
                    break
                }
            }
        }else if (data?.code === "3") {
            user.isLogin = false
            nextdo = false
        }else{
            nextdo = false
        }
    } while (nextdo)
    /*今日京豆收入*/
    let today_incomebean = 0
    for (let item of today_list) {
        if (Number(item.amount) > 0) {
            today_incomebean += Number(item.amount)
        }
    }
    /*昨日京豆收入*/
    let yesterday_incomebean = 0
    for (let item of yesterday_list) {
        if (Number(item.amount) > 0) {
            yesterday_incomebean += Number(item.amount)
        }
    }
    user.log(`今日京豆: ${today_incomebean}豆`)
    user.log(`昨日京豆: ${yesterday_incomebean}豆`)
}