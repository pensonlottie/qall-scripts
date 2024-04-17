#### 介绍
机器人菜单脚本库

#### 脚本清单
| Script Name        | Script File                | Available        | Maintenance |
|:------------------:|:--------------------------:|:----------------:|:-----------:|
| [禁用重复任务](#)   | [bot_duplicate.py](https://gitee.com/qlpanel/scripts/raw/master/qallbot/bot_duplicate.py)      | ✅(2023/03/03)  | ✅          |
| [京东资产](#)       | [bot_jd_bean.js](https://gitee.com/qlpanel/scripts/raw/master/qallbot/bot_jd_bean.js)        | ✅(2023/03/03)  | ✅          |
| [京豆明细](#)       | [bot_jd_bean_detail.js](https://gitee.com/qlpanel/scripts/raw/master/qallbot/bot_jd_bean_detail.js) | ✅(2023/03/03)  | ✅          |
| [每日一笑](#)       | [bot_joke.js](https://gitee.com/qlpanel/scripts/raw/master/qallbot/bot_joke.js)           | ✅(2023/03/03)  | ✅          |

#### 自定义菜单脚本开发
> 温馨提示：每个脚本需在menu_config.json配置后才能生效,文件名以bot_开头
<br>字段说明: name是菜单名称，script: 菜单执行对应的脚本(\*.js|\*.ts|\*.py|\*.sh)，enabled: 是否启用，admin: 需要管理员权限
<br>调用说明: qallbot机器人执行脚本调用的是青龙task命令，可以直接读取环境变量
```
[
  {"name":"京东资产", "script":"/ql/data/scripts/qallbot/bot_jd_bean.js", "enabled":true, role: "normal"}
  // 此处按照格式依次添加菜单脚本
]
```

#### QQ机器人发送脚本执行结果
> 代码片段如下(详细参考bot_jd_bean.js)：
```
// QQ机器人发送QQ消息给cookie绑定的用户
let msg = user.isLogin ? user.getLogs() : `${user.nickName}用户已过期`
await user.sendNotify(msg)
```