/*
 * 机器人发送QQ消息
 * @Date: 2023-03-26 20:12:40
 * @Last Modified by: 136542892(QQ) 
 * sendNotify 推送通知功能
 * @param cookie 通知人QQ或cookie
 * @param message 通知内容
 */
async function sendNotify(cookie, text) {
    const title = '机器人消息推送 ---> '
    const qq = (cookie && cookie.match(/qq=([^; ]+)/) && cookie.match(/qq=([^; ]+)/)[1]) || (/\d{6,}/.test(cookie) && cookie)
    if (!qq) {
        console.log(`\n${title}未发现cookie包含qq账号， 本次消息将推送至管理员！`)
        await notifyAdmin(text)
    } else {
        console.log(`\n${title}开始推送消息至QQ用户(${qq})...`)
        try {
            this.got = this.got ? this.got : require("got")
            const { retcode, errmsg } = await this.got.post(`http://127.0.0.1:1700/send_private_msg`, {
                json: {
                    user_id: qq,
                    message: text
                },
                headers: {
                    'Content-Type': 'application/json',
                }
            }).json()
            if (retcode === 0) {
                console.log(`${title}消息已推送完成`);
            } else if (retcode === 100) {
                console.log(`${title}消息推送失败: ${errmsg}`)
            } 
        } catch (e) {
            console.log(`${title}消息推送异常: ${e}`)
        }
        console.log(`${title}推送消息至QQ用户(${qq})结束！\n`)
    }
}

async function notifyAdmin(text){
    const {systemNotify} = require('./ql')
    await systemNotify('青龙', text)
}

module.exports = {
    sendNotify, notifyAdmin
}