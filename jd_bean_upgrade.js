/*
****************************
new Env('京东升级赚京豆')
****************************
【 脚本每日8和16点执行一次 】
cron:1 8,16,20,22 * * *
更新时间: 2023.03.20
如果转载: 请注明出处
****************************/
require("./lib/user").jd_user('升级赚京豆', async (user)=>{
    /*以下是活动函数*/
    await upgradeBean(user)     // 升级赚京豆
    console.log(user.getLogs())
})

async function upgradeBean(user) {
    const taskName = "【升级赚京豆】"
    let taskList = []
    // 获取任务列表
    let options = await upgradeBean_common('beanTaskList', user)
    let resp = await user.get(options).json()
    if (resp.code == 0 && resp.data?.taskInfos) {
        const {curLevel, nextLevelBeanNum, taskInfos} = resp.data
        taskList = taskInfos
        user.log(`🟢${taskName}当前等级: ${curLevel}，下一级可领取: ${nextLevelBeanNum}京豆`)
    }
    // 签到任务
    for (let i = 0; i < taskList.length; i++) {
        let task = taskList[i]
        if (task.status == 1) {
            let subtasks = task.subTaskVOS
            let waitTime = task.waitDuration
            for (const subTask of subtasks) {
                await user.wait(1)
                user.subTask = subTask
                if (waitTime) {
                    user.subTask.actionType = 1
                    options = await upgradeBean_common('beanDoTask', user)
                    resp = await user.get(options).json()
                    // 浏览指定秒数
                    await user.wait(waitTime+1, waitTime+3)
                }
                // 签到
                user.subTask.actionType = 0
                options = await upgradeBean_common('beanDoTask', user)
                resp = await user.get(options).json()
                if (resp.code === "0" && resp.data?.bizCode === "0") {
                    user.log(`${subTask.title}${resp.data.bizMsg}`)
                }else{
                    user.log(`${subTask.title}任务失败!`)
                    
                }
                user.subTask = null
            }
        }else if (task.status === 2) {
            user.log(`${task.taskName}任务已完成，获得+${task.score}成长值`)
        }
    }

}
async function upgradeBean_common(functionId, user){
    const uuid = user.randomString(40)
    const url = `https://api.m.jd.com/client.action?functionId=${functionId}&appid=ld&client=apple&clientVersion=10.1.2&networkType=wifi&osVersion=14.2&uuid=${uuid}&openudid=${uuid}`
    let body = ''
    const options = {
        headers: {"Referer": "https://h5.m.jd.com/"}
    }
    switch (functionId) {
        case 'beanTaskList':
            body = encodeURIComponent(`{"viewChannel":"AppHome"}`)
            options.url = `${url}&body=${body}`
            break
        case 'beanDoTask':
            body = encodeURIComponent(`{"actionType":${user.subTask.actionType},"taskToken":"${user.subTask.taskToken}"}`)
            options.url = `${url}&body=${body}`
            break
        default:
            options = null
            console.log(`错误：${functionId}`)
    }
    return options
}
