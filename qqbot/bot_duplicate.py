"""
禁用重复任务
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from lib.user import *
import time

def filter_res_sub(tasklist: list, sub_list: list) -> tuple:
    filter_list = []
    reserve_list = []
    disable_num = 0
    for task in tasklist:
        flag = False
        for sub in sub_list:
            if task.get("command").find(sub) > -1:
                flag = True
                break

        if flag:
            reserve_list.append(task)
        else:
            filter_list.append(task)

        if task['isDisabled'] == 1:
            disable_num += 1
    return filter_list, reserve_list, disable_num


def get_index(lst: list, item: str) -> list:
    return [index for (index, value) in enumerate(lst) if value == item]


def get_duplicate_list(dupids:list, filter_list: list) -> list:
    names = []
    for task in filter_list:
        names.append(task.get("name"))

    name_list = list(set(names))
    tem_tasks = []
    for name2 in name_list:
        name_index = get_index(names, name2)
        for i in range(len(name_index)):
            tmp_task = filter_list[name_index[i]]
            if i == 0 and tmp_task['isDisabled'] == 0:
                tem_tasks.append(tmp_task)
            elif tmp_task['isDisabled'] == 0:
                print(f"🚫  {tmp_task['command']}      --->  {tmp_task['name']}")
                dupids.append(tmp_task['id'])
    return tem_tasks


def reserve_task_only(dupids: list, reserve_list: list, tem_tasks: list):
    for task1 in reserve_list:
        for task2 in tem_tasks:
            if task1.get("name") == task2.get("name") and task1.get('isDisabled') == 0:
                print(f"🚫  {task2.get('command')}     --->  {task2['name']}")
                dupids.append(task2.get("id"))


def get_invalid_schedule(dupids: list, reserve_list: list, tem_tasks: list):
    for task in reserve_list:
        if task.get("schedule").startswith("1 1 1 1") and task.get('isDisabled') == 0:
            print(f"🚫  {task.get('command')}     --->  {task['name']}")
            dupids.append(task.get("id"))
    for task in tem_tasks:
        if task.get("schedule").startswith("1 1 1 1") and task.get('isDisabled') == 0:
            print(f"🚫  {task.get('command')}     --->  {task['name']}")
            dupids.append(task.get("id"))

@jd_cookies
def disable_duplicate_task(cookies, User):
    cookie = cookies[0]
    user = User(cookie)
    print("==========>【筛选禁用重复任务】<==========")
    # 指定保留的任务(不做重复任务过滤)
    tasks_prefix_list = user.getEnv("TASK_PREFIX", "shufflewzc_faker").split(",")
    print(f"保留的任务前缀为："+"\n".join(tasks_prefix_list))
    print("筛选禁用任务列表开始...\n----------------------------------------->")
    tasklist = user.get_ql_tasks()
    # filter_list：提取需要过滤重复的任务， reserve_list：提取指定保留的任务(不包含已禁用的任务)
    filter_list, reserve_list, disableSum = filter_res_sub(tasklist, tasks_prefix_list)
    dupids = []
    # 根据任务名对未指定的保留任务集合进行是重复过滤
    tem_tasks = get_duplicate_list(dupids, filter_list)
    # 是否在重复任务中只保留设置的前缀
    reserve_task_only(dupids, reserve_list, tem_tasks)
    # 禁用无意义表达式任务
    get_invalid_schedule(dupids, reserve_list, tem_tasks)
    print(f"----------------------------------------->\n筛选禁用任务列表结束!!!")

    print("\n==========>【执行禁用重复任务】<==========")
    if len(dupids) == 0:
        print("没有重复任务~😁")
    else:
        print(f"本次禁用的任务数量：{len(dupids)}, 准备执行禁用...~")
        data = disable_ql_tasks(dupids)
        if data.get('code') == 200:
            print("禁用重复任务执行成功~")

    task_sum = f"所有任务数量：{len(tasklist)}"
    disable_sum = f"已禁用数量：{disableSum}"
    undisable_sum = f"未禁用数量：{len(tasklist)-disableSum-len(dupids)}"
    reserve_num = "\n".join(tasks_prefix_list)+f"数量：{len(reserve_list)}"
    print("\n======>【统计禁用重复任务数量】<======\n" + task_sum + "\n" + disable_sum + "\n" + undisable_sum + "\n" + reserve_num )
    rt_msg = f"【禁用重复任务】\n{task_sum}\n{disable_sum}\n{undisable_sum}\n{reserve_num}"
    user.sendNotify(rt_msg)
    print(f"QQ通知{cookie['qq']}禁用重复脚本任务结束...")

if __name__ == "__main__":
    disable_duplicate_task('禁止重复脚本任务')