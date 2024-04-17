/*
****************************
new Env('京东每日一签')
****************************
【 脚本每日8点执行一次 】
cron:1 8 * * *
更新时间: 2023.03.21 
如果转载: 请注明出处
****************************/
require("./lib/user").jd_user('京东每日一签', async (user)=>{
    /*以下是活动函数*/
    await jdSign(user),             // 无线签到
    await jrSign(user),             // 金融签到
    await jrDoubleSign(user),       // 金融双签
    await vipSign(user),            // 会员签到
    await browerTask(user)          // 浏览任务
    console.log(user.getLogs())
})


async function browerTask(user) {
    const taskName = "【浏览任务奖励】"
    user.log(`${taskName}开始执行...`)
    // 完成多任务
    for (let index = 0; index < 10; index++) {
        // 每个任务间隔5-7秒完成
        await user.wait(5, 7)
        let body = JSON.stringify({
            "version": "9.0.0.1", "monitor_source": "plant_app_plant_index", "monitor_refer":"",
            "awardFlag": false, "skuId": `${user.randomNumber(10000000, 20000000)}`, "source": "feeds", "type": '1'
        })
        options = {
            url: 'https://api.m.jd.com/',
            body: `functionId=beanHomeTask&body=${encodeURIComponent(body)}&appid=ld&client=apple&area=5_274_49707_49973&build=167283&clientVersion=9.1.0`,
        }
        let data = await user.post(options).json()
        if (data.code === '0' && data.data) {
            const {taskProgress, taskThreshold} = data.data
            user.log(`任务完成进度：${taskProgress}/${taskThreshold}`)
            if (taskProgress === taskThreshold) {
                await user.wait(1, 3)
                // 已完成任务领取京豆 
                body = JSON.stringify({ 
                    "version": "9.0.0.1", "monitor_source": "plant_app_plant_index", "monitor_refer":"",
                    "awardFlag": true, "source": "feeds" 
                })
                options = {
                    url: 'https://api.m.jd.com/',
                    body: `functionId=beanHomeTask&body=${encodeURIComponent(body)}&appid=ld&client=apple&area=5_274_49707_49973&build=167283&clientVersion=9.1.0`,
                }
                data = await user.post(options).json()
                if (data?.data?.beanNum) {
                    user.log(`🟢领奖成功，获得 ${data.data.beanNum} 个京豆`)
                }
                break
            }
        }else{
            user.log(`🟡${data.errorMessage || "未知错误！"}`)
            break
        }
    }
    
}

async function vipSign(user) {
    await user.wait(3, 5)
    const taskName = "【会员签到】"
    let body = encodeURIComponent(`{"paramData":{"token":"dd2fb032-9fa3-493b-8cd0-0d57cd51812d"}}`)
    let options = {
        url: `https://api.m.jd.com/?t=${Date.now()}&appid=sharkBean&functionId=pg_channel_page_data&body=${body}`,
        headers: {"Referer": "https://spa.jd.com/home",}
    }
    let data = await user.get(options).json()
    if (data.success && data?.data?.floorInfoList) {
        const SIGN_ACT_INFO = data.data.floorInfoList.filter(vo => !!vo && vo.code === 'SIGN_ACT_INFO')[0]
        const {token, floorData:{signActInfo},} = SIGN_ACT_INFO
        const currSignCursor = signActInfo.currSignCursor
      body = encodeURIComponent(`{"floorToken": "${token}", "dataSourceCode": "signIn", "argMap": {"currSignCursor": ${currSignCursor}}}`)
      options = {
        url: `https://api.m.jd.com/?appid=sharkBean&functionId=pg_interact_interface_invoke&body=${body}`,
        headers: {"Accept": "application/json","Origin": "https://spa.jd.com","Referer": "https://spa.jd.com/"}
      }
      await user.wait(1)
      const signRes = await user.post(options).json()
      if (signRes.success && signRes?.data?.rewardVos) {
        const beanNum = signRes?.data?.rewardVos[0].jingBeanVo.beanNum
        user.log(`🟢${taskName}第${currSignCursor}天签到成功，京东+${beanNum}`)
      }else {
        user.log(`🟡${taskName}${signRes.message}`)
      }
    } 
}

async function jdSign(user) {
    const taskName = "【京东签到】"
    const options = {
        url: `https://api.m.jd.com/client.action?functionId=signBeanAct&appid=ld`,
        headers: {Referer: 'https://wqs.jd.com/'}
    }
    const data = await user.get(options).json()
    if (data?.data?.status === '1') {
        const award = data.data.dailyAward || data.data.continuityAward
        const beanCount = Number(award.beanAward.beanCount) || 0
        user.log(`🟢${taskName}获得${beanCount}个京豆`)
    }else if (data?.data?.status === '2') {
        const award = data.data.dailyAward || data.data.continuityAward
        const beanCount = Number(award.beanAward.beanCount) || 0
        user.log(`🟢${taskName}今天已签到${beanCount}个京豆`)
    }
}

async function getRSAPubKey(user){
    const body = encodeURIComponent(`{"channel":"sy","channelLv":"sy"}`)
    const options = {
        url: `https://ms.jr.jd.com/gw/generic/hy/h5/m/getRSAPubKey`,
        Referer: "https://member.jr.jd.com/",
        body: `reqData=${body}`
    }
    const data = await user.post(options).json()
    if (data?.resultCode == 0 && data?.resultData?.resBusiCode == 0) {
       return data.resultData.resBusiData 
    }
}

async function loadJD_signjs(user) {
    const {JSDOM, ResourceLoader, VirtualConsole} = require('jsdom')
    const virtualConsole = new VirtualConsole()
    // virtualConsole.sendTo(console)
    const resLoader = new ResourceLoader({
        "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100101 Firefox/91.0",
        "referer": "https://u.jr.jd.com/"
    })
    const pageContent =  "<body>  <script src=\"https://jrsecstatic.jdpay.com/jr-sec-dev-static/aar2.min.js\"></script>  <script src=\"https://m.jr.jd.com/common/jssdk/jrbridge/2.0.0/jrbridge.js\"></script>  <script src=\"https://jrsecstatic.jdpay.com/jr-sec-dev-static/cryptico.min.js\"></script>  <script src=\"//gia.jd.com/m.html\"></script>  <script src=\"//gias.jd.com/js/m.js\"></script>  </body>"
    const dom = new JSDOM(pageContent, {
        "url": "https://u.jr.jd.com/uc-fe-wxgrowing/18-quan-yi-day/index.html",
        "referer": "https://u.jr.jd.com/",
        "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100101 Firefox/91.0",
        "runScripts": "dangerously",
        "includeNodeLocations": true,
        "storageQuota": 10000000,
        "pretendToBeVisual": true,
        "resources": resLoader,
        "virtualConsole": virtualConsole
    })
    await user.sleep(2)
    const rt = {}
    rt.getid = dom.window.getJdEid()
    dom.window.AAR2.init()
    rt.ar2 = new dom.window.AAR2(),
    rt.cry = dom.window.cryptico
    rt.getid.eid = ''
    /*************服务器公钥****************/
    // await getRSAPubKey(user): 因为固定此处写死
    const rsaKey = JSON.stringify({
        shaKey: '4hqrnwGzxzQiAP18jLaMvIBOdi3LB4Aim3BwSrBrpNI=',
        pubKey: '6MGw6YfxVGVi5yZD8dN+QD7oJLsFkP/0lylFAM6X6uepNO+12NRvE1hsW3J6SVsF/0LKx56hlq1og9Rt2Ifw28Tq7QhxvKZ2VLolJeTG3E/wGvziVqERw/UM49LCQhjmoNaVaT4DVPjfbuZ7K5kk7g65sKg/EjWqQ2pqhqDK89ShXGXtmJu/bD/1/Nt+jh+AhZuCqa7EweVK3qFixV6l77pQuxjv89WmzP2VCsqjysPmKNf0mU/wr09a8yTMGidxQrlMXpU7wD/e0ZhPwaRgb58+1QPtajekXvYOUzYPdZ832x1/NIwD5cpHbX7YQMvDMYECrzGLCXzCFTK6vZ3vJw=='
    })
    rt.cry.setPublicKeyString(rsaKey)
    /***************************************/
    const videoInfo = {
        "videoId": "311372930347370496",
        "channelSource": "JRAPP6.0",
        "noa": rt.ar2.nonce()
    }
    const {cipher} = rt.cry.encryptData(JSON.stringify(videoInfo))
    const deviceInfo = JSON.stringify({
        "deviceId": "",
        "clientType": "android",
        "user_agent": user.getBrowserAgent(),
        "iosType": "android",
        "osv": "12",
        "brand": "Redmi",
        "hwv": "",
        "network": 1,
        "mac": "",
        "androidId": "",
        "oaid": ""
    })
    const signData = JSON.stringify({
        "site": "JD_JR_APP",
        "videoId": videoInfo.videoId,
        "channelSource": videoInfo.channelSource,
        "encryptData": cipher,
        "riskDeviceParam": rt.getid,
        "deviceInfo": deviceInfo,
        "adInfo": deviceInfo,
        "clientType": "android",
        "arrEncrypt": true
    })
    const body = {
        "site": "JD_JR_APP",
        "videoId": videoInfo.videoId,
        "channelSource": videoInfo.channelSource,
        "encryptData": cipher,
        "riskDeviceParam": JSON.stringify(rt.getid),
        "deviceInfo": deviceInfo,
        "adInfo": deviceInfo,
        "clientType": "android",
        "arrEncrypt": true,
        "signData": signData,
        "signature": rt.ar2.sign(signData, videoInfo.noa),
        "nonce": videoInfo.noa,
        "channel": "sy",
        "channelLv": "sy"
    }
    return body
}


async function jrSign(user){
    await user.wait(3, 5)
    const taskName = "【金融签到】"
    const rt = await loadJD_signjs(user)
    const body = encodeURIComponent(JSON.stringify(rt))
    const options = {
        url: 'https://ms.jr.jd.com/gw/generic/hy/h5/m/jrSign',
        headers: {
            Referer: 'https://member.jr.jd.com/',
        },
        body: `reqData=${body}`
    }
    const data = await user.post(options).json()
    if (data?.resultCode == 0 && data?.resultData?.resBusiCode == 0) {
        user.log(`🟢${taskName}签到成功`)
    }else{
        user.log(`🟡${taskName}${data.resultData.resBusiMsg}`)
    }
}

async function jrDoubleSign(user) {
    await user.wait(3, 5)
    const taskName = "【金融双签】"
    const body = encodeURIComponent(`{"actCode":"F68B2C3E71","type":3,"frontParam":{"belong":"jingdou"}}`)
    const options = {
        url: `https://nu.jr.jd.com/gw/generic/jrm/h5/m/process`,
        body: `reqData=${body}`
    }
    const data = await user.post(options).json()
    if (data.resultData.data.businessData.businessCode === '000sq') {
        user.log(`🟢${taskName}${data.resultData.data.businessData.businessData.awardListVo[0].name}`)
    }else{
        user.log(`🟡${taskName}${data.resultData.data.businessData.businessMsg}`)
    }
    // 查询双签状态
    await doubleSignInfo(user)
}

async function doubleSignInfo(user) {
    const taskName = "【京融双签状态】"
    const body = encodeURIComponent(`{"actCode":"F68B2C3E71","type":9,"frontParam":{"channel":"JD","belong":"jingdou"}}`)
    const options = {
        url: `https://nu.jr.jd.com/gw/generic/jrm/h5/m/process?_=${new Date().getTime()}&reqData=${body}`,
        headers: {
            Origin: 'https://member.jr.jd.com',
            Referer: 'https://member.jr.jd.com/activity/sign/v5/indexV2.html?channelLv=shuangqian&sid=dace0970cf046301400564834161022w',
        }
    }
    const data = await user.post(options).json()
    if (data?.resultData?.code == 200) {
        const signStatus = data.resultData.data.businessData
        user.log(`🟢${taskName}${signStatus.signInJd ? '京东签到完成✓' : '京东签到未完成⨉'} ${signStatus.signInJr ? '金融签到完成✓' : '金融签到未完成⨉'} ${signStatus.get ? '双签礼包已领✓' : '双签礼包未领⨉'}`)
    }
}
