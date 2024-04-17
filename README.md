# qallbot-scripts

#### 介绍
青龙脚本库和机器人脚本库

#### 免责声明
> ***您使用或者复制了本仓库的任何脚本，则视为`已接受`此声明且遵守下载后的24小时内清除所有下载内容，请仔细阅读***
* 本仓库发布的项目中涉及的任何解锁和解密分析脚本，仅用于测试和学习研究，禁止用于商业用途、传播。不能保证其合法性和有效性，对任何脚本问题概不负责，后果自负，请根据情况自行判断。

* 如果任何单位或个人认为该项目的脚本可能涉嫌侵犯其权利，则应及时通知并提供身份证明，所有权证明，作者将在收到认证文件后删除相关脚本。

* 任何人以任何方式查看此项目或直接、间接使用该项目的任何脚本的使用者都应仔细阅读此声明。一旦使用并复制了该项目的任何脚本，则视为您已接受此免责声明。

#### 脚本列表
1.  京东账号检测([jd_check.js](https://gitee.com/qlpanel/scripts/blob/master/jd_check.js)) 每日7点执行一次
2.  京东每日一签([jd_bean_sign.js](https://gitee.com/qlpanel/scripts/blob/master/jd_bean_sign.js)) 每日8点执行一次
3.  升级赚京豆([jd_bean_upgrade.js](https://gitee.com/qlpanel/scripts/blob/master/jd_bean_upgrade.js)) 每日8点和16点各执行一次
4.  京东每日抽奖京豆([jd_bean_chou.js](https://gitee.com/qlpanel/scripts/blob/master/jd_bean_chou.js)) 每日8点10分执行一次
5.  京喜特价双签([jd_jx_double_sign.js](https://gitee.com/qlpanel/scripts/blob/master/jd_jx_double_sign.js))每日8点25分执行一次
#### 拉取仓库
> 提示：白名单、白名单、依赖、、文件后缀参数有多个则竖线进行分割
<br>ql  repo <仓库地址> <白名单路径正则匹配> <黑名单路径正则匹配> <依赖文件> <仓库分支> <文件后缀>
```
ql repo https://gitee.com/hj_qinglong/qallbot-scripts.git "jd_" "lib|qallbot" "lib|qallbot"
```

#### 仓库脚本依赖
```
{
    "dependencies": {
        "got": "^11.5.1",
        "crypto-js": "^4.0.0"
    }
}
```
> 拉库前请在青龙面板安装以下依赖
```
got
crypto-js
```

#### 青龙命令
```
# 更新并重启青龙
ql update                                                    
# 运行自定义脚本extra.sh
ql extra                                                     
# 添加单个脚本文件
ql raw <脚本地址url>                                             
# 添加单个仓库的指定脚本
ql repo <仓库地址url> <白名单> <黑名单> <依赖> <分支> <文件后缀>
# 删除旧日志
ql rmlog <天数>                                              
# 启动tg-bot
ql bot                                                       
# 检测青龙环境并修复
ql check                                                     
# 重置登录错误次数
ql resetlet                                                  
# 禁用两步登录
ql resettfa                                                  

# 依次执行，如果设置了随机延迟，将随机延迟一定秒数
task <本地脚本路径>                                             
# 依次执行，无论是否设置了随机延迟，均立即运行，前台会输出日，同时记录在日志文件中
task <本地脚本路径> now                                         
# 并发执行，无论是否设置了随机延迟，均立即运行，前台不产生日，直接记录在日志文件中，且可指定账号执行，多账号空格分割
task <本地脚本路径> conc <环境名称> <环境名称序号>(可选的) 
# 指定账号执行，无论是否设置了随机延迟，均立即运行 
task <本地脚本路径> desi <环境名称> <环境名称序号>      
# 设置任务超时时间   
task -m <超时时间，后缀"s"代表秒(默认值), "m"代表分, "h"代表小时, "d"代表天> <本地脚本路径>
# 实时打印任务日志，创建定时任务时，不用携带此参数
task -l <本地脚本路径>
```

### 访问量
![](http://profile-counter.glitch.me/passerby-b/count.svg)