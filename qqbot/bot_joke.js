const got = require('got')
require("../lib/user").jd_cookies('每日一笑接口调用', async (cookies, User)=>{
    const fun_arr = [caihongpi, saohua, shenhuifu, tiangou, joke]
    const idx = User.randomNumber(0, fun_arr.length)
    const msg = await fun_arr[idx]()
    console.log(msg)
    await new User({cookie:cookies[0], got}).sendNotify(msg)
})

async function joke() {
    const options = {url:"https://api.vvhan.com/api/joke?type=json"}
    let {title, joke} = await got.get(options).json()
    return (`《笑话:${title}》\n ${joke}`)
}

async function tiangou() {
    const options = {url:"http://v.api.aa1.cn/api/tiangou/index.php?aa1=json"}
    const {msg} = await got.get(options).json()
    return (`《舔狗语录》\n ${msg}`)
}

async function shenhuifu() {
    const options = {url:"https://v.api.aa1.cn/api/api-wenan-shenhuifu/index.php?aa1=json"}
    const data = await got.get(options).json()
    const msg = data[0].shenhuifu.replace('<br>', '\n').replaceAll('<br>', '')
    return (`《神回语录》\n ${msg}`)
}

async function saohua() {
    const options = {url:"https://v.api.aa1.cn/api/api-saohua/index.php?type=json"}
    const {saohua:msg} = await got.get(options).json()
    return (`《骚话语录》\n ${msg}`)
}

async function caihongpi(user) {
    const options = {url:"https://api.qqsuu.cn/api/dm-caihongpi"}
    const {data:{content:msg}} = await got.get(options).json()
    return (`《彩屁语录》\n ${msg}`)
}