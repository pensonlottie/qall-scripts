import re
import requests

"""
* 机器人发送QQ消息
* @Date: 2023-02-03 10:12:40
* @Last Modified by: 136542892(QQ) 
* sendNotify 推送通知功能
* @param cookie 通知人QQ或cookie
* @param message 通知内容
"""
def sendNotify(cookie, text):
    title = '机器人消息推送 ---> '
    qqinfo = re.search(r'qq=([^; ]+;)', cookie, re.M | re.I)
    qq = qqinfo[0] if qqinfo else re.search(r'\d{6,}', cookie, re.M | re.I)[0]
    if qq:
        print(f"\n{title}开始推送消息至QQ用户({qq})...")
        headers = {"Content-Type":"application/json"}
        payload = {"user_id": qq, "message": text}
        rs = requests.post("http://127.0.0.1:1700/send_private_msg", json=payload, headers=headers).json()
        if rs['retcode'] == 0:
            print(f"{title}消息已推送完成")
        elif rs['retcode'] == 100:
            print(f"{title}消息推送失败: {rs['errmsg']}")
        print(f"{title}推送消息至QQ用户({qq})结束！\n")
    else:
        print(f"\n{title}请检查cookie是否包含qq=xxxx;? 消息推送失败！")
        