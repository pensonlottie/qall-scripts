/*
****************************
new Env('京喜特价双签')
****************************
【 脚本每日8点25执行一次 】
cron:25 8 * * *
更新时间: 2023.04.02
如果转载: 请注明出处
****************************/
const crypto = require("crypto-js")
require("./lib/user").jd_user('京喜特价双签', async (user) => {
    await jxDoubleSign(user)        // 入口->京东app->领京豆->特价领豆
    console.log(user.getLogs())
})

async function jxDoubleSign(user) {
    // https://wqs.jd.com/pingou/double_signin_js/index.html
    const taskName = "【特价双签】"
    let resp = await user.get(await sign_options('tjsigned_signedInfo', user)).json()
    if (resp?.data?.double_sign_status == 0) {
        resp = await user.get(await sign_options('tjsigned_issueReward', user)).json()
        if (resp?.retCode == 0 && resp?.data?.jx_award) {
            user.log(`${taskName}获得+${resp.data.jx_award}京豆`)
        } else {
            user.log(`${taskName}失败:${resp.errorMessage || resp.msg || resp.errMsg || JSON.stringify(resp)}`)
        }
    }else{
        user.log(`${taskName}今天已签过到！`)
    }
}

async function sign_options(functionId, user) {
    const st = Date.now()
    const h5st = await build_h5st(user)
    const param = {
        "_t": st - 3,
        "h5st": h5st,
        "_stk": "_t",
        "sceneval": 2,
        "buid": 325,
        "appCode": "msc588d6d5",
        "time": st
    }
    param.signStr = getSignString(param)
    // console.log(param)
    const body = encodeURIComponent(JSON.stringify(param))
    const options = {
        url: `https://api.m.jd.com/api?functionId=${functionId}&appid=jx_h5&t=${st}&channel=jxh5&cv=1.2.5&clientVersion=1.2.5&client=jxh5&uuid=6003214960131566560&cthr=1&loginType=2&body=${body}`,
        headers: { "Referer": "https://wqs.jd.com" }
    }
    return options
}

function getSignString(t) {
    var e = function (t) {
        var e = "";
        for (var n in t) {
            var r = t[n];
            r instanceof Object && (r = JSON.stringify(r)),
                void 0 != r && null != r && ("number" == typeof r ? e += "&" + r : "boolean" == typeof r ? e += "&" + r : "" != r && (e += "&" + r))
        }
        return e = e.substring(1, e.length)
    }(function (t) {
        var e = [], n = 0;
        for (var r in t)
            e[n] = r,
                n++;
        var o = e.sort(), a = {};
        for (var u in o)
            a[o[u]] = t[o[u]];
        return a
    }(t));
    return e = e.toString(), md5(e, "xtl_sqg_mall-^&*-damai_(789)_@#$")
}

function md5(paramSign, key) {
    var t = paramSign, r = key;
    return g(x(r, t))
}

function a(t, e) {
    var n = (65535 & t) + (65535 & e);
    return (t >> 16) + (e >> 16) + (n >> 16) << 16 | 65535 & n
}
function u(t, e, n, r, o, i) {
    return a(function (t, e) {
        return t << e | t >>> 32 - e
    }(a(a(e, t), a(r, i)), o), n)
}
function c(t, e, n, r, o, i, a) {
    return u(e & n | ~e & r, t, e, o, i, a)
}
function s(t, e, n, r, o, i, a) {
    return u(e & r | n & ~r, t, e, o, i, a)
}
function f(t, e, n, r, o, i, a) {
    return u(e ^ n ^ r, t, e, o, i, a)
}
function l(t, e, n, r, o, i, a) {
    return u(n ^ (e | ~r), t, e, o, i, a)
}
function d(t, e) {
    var n, r, o, i, u;
    t[e >> 5] |= 128 << e % 32,
        t[14 + (e + 64 >>> 9 << 4)] = e;
    var d = 1732584193
        , p = -271733879
        , v = -1732584194
        , h = 271733878;
    for (n = 0; n < t.length; n += 16)
        r = d,
            o = p,
            i = v,
            u = h,
            p = l(p = l(p = l(p = l(p = f(p = f(p = f(p = f(p = s(p = s(p = s(p = s(p = c(p = c(p = c(p = c(p, v = c(v, h = c(h, d = c(d, p, v, h, t[n], 7, -680876936), p, v, t[n + 1], 12, -389564586), d, p, t[n + 2], 17, 606105819), h, d, t[n + 3], 22, -1044525330), v = c(v, h = c(h, d = c(d, p, v, h, t[n + 4], 7, -176418897), p, v, t[n + 5], 12, 1200080426), d, p, t[n + 6], 17, -1473231341), h, d, t[n + 7], 22, -45705983), v = c(v, h = c(h, d = c(d, p, v, h, t[n + 8], 7, 1770035416), p, v, t[n + 9], 12, -1958414417), d, p, t[n + 10], 17, -42063), h, d, t[n + 11], 22, -1990404162), v = c(v, h = c(h, d = c(d, p, v, h, t[n + 12], 7, 1804603682), p, v, t[n + 13], 12, -40341101), d, p, t[n + 14], 17, -1502002290), h, d, t[n + 15], 22, 1236535329), v = s(v, h = s(h, d = s(d, p, v, h, t[n + 1], 5, -165796510), p, v, t[n + 6], 9, -1069501632), d, p, t[n + 11], 14, 643717713), h, d, t[n], 20, -373897302), v = s(v, h = s(h, d = s(d, p, v, h, t[n + 5], 5, -701558691), p, v, t[n + 10], 9, 38016083), d, p, t[n + 15], 14, -660478335), h, d, t[n + 4], 20, -405537848), v = s(v, h = s(h, d = s(d, p, v, h, t[n + 9], 5, 568446438), p, v, t[n + 14], 9, -1019803690), d, p, t[n + 3], 14, -187363961), h, d, t[n + 8], 20, 1163531501), v = s(v, h = s(h, d = s(d, p, v, h, t[n + 13], 5, -1444681467), p, v, t[n + 2], 9, -51403784), d, p, t[n + 7], 14, 1735328473), h, d, t[n + 12], 20, -1926607734), v = f(v, h = f(h, d = f(d, p, v, h, t[n + 5], 4, -378558), p, v, t[n + 8], 11, -2022574463), d, p, t[n + 11], 16, 1839030562), h, d, t[n + 14], 23, -35309556), v = f(v, h = f(h, d = f(d, p, v, h, t[n + 1], 4, -1530992060), p, v, t[n + 4], 11, 1272893353), d, p, t[n + 7], 16, -155497632), h, d, t[n + 10], 23, -1094730640), v = f(v, h = f(h, d = f(d, p, v, h, t[n + 13], 4, 681279174), p, v, t[n], 11, -358537222), d, p, t[n + 3], 16, -722521979), h, d, t[n + 6], 23, 76029189), v = f(v, h = f(h, d = f(d, p, v, h, t[n + 9], 4, -640364487), p, v, t[n + 12], 11, -421815835), d, p, t[n + 15], 16, 530742520), h, d, t[n + 2], 23, -995338651), v = l(v, h = l(h, d = l(d, p, v, h, t[n], 6, -198630844), p, v, t[n + 7], 10, 1126891415), d, p, t[n + 14], 15, -1416354905), h, d, t[n + 5], 21, -57434055), v = l(v, h = l(h, d = l(d, p, v, h, t[n + 12], 6, 1700485571), p, v, t[n + 3], 10, -1894986606), d, p, t[n + 10], 15, -1051523), h, d, t[n + 1], 21, -2054922799), v = l(v, h = l(h, d = l(d, p, v, h, t[n + 8], 6, 1873313359), p, v, t[n + 15], 10, -30611744), d, p, t[n + 6], 15, -1560198380), h, d, t[n + 13], 21, 1309151649), v = l(v, h = l(h, d = l(d, p, v, h, t[n + 4], 6, -145523070), p, v, t[n + 11], 10, -1120210379), d, p, t[n + 2], 15, 718787259), h, d, t[n + 9], 21, -343485551),
            d = a(d, r),
            p = a(p, o),
            v = a(v, i),
            h = a(h, u);
    return [d, p, v, h]
}
function p(t) {
    var e, n = "", r = 32 * t.length;
    for (e = 0; e < r; e += 8)
        n += String.fromCharCode(t[e >> 5] >>> e % 32 & 255);
    return n
}
function v(t) {
    var e, n = [];
    for (n[(t.length >> 2) - 1] = void 0,
        e = 0; e < n.length; e += 1)
        n[e] = 0;
    var r = 8 * t.length;
    for (e = 0; e < r; e += 8)
        n[e >> 5] |= (255 & t.charCodeAt(e / 8)) << e % 32;
    return n
}
function x(t, e) {
    var n, r, o = v(t), a = [], u = [];
    for (a[15] = u[15] = void 0,
        o.length > 16 && (o = d(o, 8 * t.length)),
        n = 0; n < 16; n += 1)
        a[n] = 909522486 ^ o[n],
            u[n] = 1549556828 ^ o[n];
    r = d(a.concat(v(e)), 512 + 8 * e.length)
    r = p(d(u.concat(r), 640))
    return r
}

function g(t) {
    var e, n, r = "";
    for (n = 0; n < t.length; n += 1)
        e = t.charCodeAt(n),
            r += "0123456789abcdef".charAt(e >>> 4 & 15) + "0123456789abcdef".charAt(15 & e);
    return r
}

function build_fp() {
    const numStr = "0123456789"
    let randomStr1 = ""
    do {
        let tmpstr = getSizeStr({ "size": 1, "num": numStr })
        randomStr1.indexOf(tmpstr) == -1 && (randomStr1 += tmpstr)
    } while (randomStr1.length < 3);

    let randomStr2 = numStr
    for (let i of randomStr1.slice()) {
        randomStr2 = randomStr2.replace(i, "");
    }

    function getSizeStr(param) {
        let size = param.size
        let num = param.num
        let rt = ""
        for (; size--;) rt += num[Math.random() * num.length | 0]
        return rt
    }

    const randomSize = Math.random() * 10 | 0
    const fp = getSizeStr({ "size": randomSize, "num": randomStr2 })
        + randomStr1
        + getSizeStr({ "size": 12 - randomSize, "num": randomStr2 })
        + randomSize
    return fp
}

function dateFmt(t) {
    var t, e = t ? t : Date.now(), n = "yyyyMMddhhmmssSSS", r = new Date(e), o = n, i = {
        "M+": r.getMonth() + 1,
        "d+": r.getDate(),
        "h+": r.getHours(),
        "m+": r.getMinutes(),
        "s+": r.getSeconds(),
        "S+": r.getMilliseconds()
    };
    const d = [r.getFullYear()]
    for (const k in i) {
        const v = i[k].toString(), len = v.length
        d.push("S+" === k ? "000".concat(v).slice(len) : "00".concat(v).slice(len))
    }
    return d.join("")
}

async function request_algo(appId, user) {
    const algos = [
        "function test(tk,fp,ts,ai,algo){var rd='NMgQhcQu5hiR';var str=`${tk}${fp}${ts}${ai}${rd}`;return algo.MD5(str)}",
        "function test(tk,fp,ts,ai,algo){var rd='XQW07Bkz6SGs';var str=`${tk}${fp}${ts}${ai}${rd}`;return algo.HmacSHA256(str,tk)}",
        "function test(tk,fp,ts,ai,algo){var rd='yWPQ9MHCprqA';var str=`${tk}${fp}${ts}${ai}${rd}`;return algo.SHA512(str)},"
    ]
    const fp = 7480717182567389,
        tk = "tk03wa0fb1c1218nI1EGUVRLLvdyv_YPITqRLnGA2PHDkQn3j6JjlQXunfAHhKt-p8VvRThRpeQe1KLkDfOQ4rYt35iY",
        algo = new Function("return " + algos[0])()
    return { fp, tk, algo }

    /* const fp = build_fp()
    const options = {
        //https://cactus.jd.com/request_algo?g_tk=294297029&g_ty=ajax
        url: "https://cactus.jd.com/request_algo?g_ty=ajax",
        json: {
            "appId": appId,
            "version": "3.1",
            "fp": fp,
            "timestamp": Date.now(),
            "platform": "web",
            "expandParams": "",
            // "expandParams": "5e2976855ec13d55dbffcc514b657c9ec71b38bcd7d88f101ff260cf6b8a04fae8a99396e1282784963bc1d386b5684f547ea029db6f43d5c60ccd5861806e3ac1756be544f35482401505e5b8ea376ab10eb21038d6586d0b3523246a05632231c3f931b3c1cc1ed721323b0d7ca0d0ab833d658044a3c16c7f862e2267df47ae0db476a6846a6d8d9743d28e628142cce0d9f255ff343b2f708dec93a166c1ea5cedcf31820c91e15838c141617fb19a07f2b5a96773b3383fa5e962625da9aa90986215a78509037ab6de6c19d16cf71ee1a1b8e6e6dc0935e0316d70a64f66a6d5c920b3ca8a329894c276156ed28fd79c3c4d8fc7d752c40631bf6772242337a80232b4609fe210cc0aceb66c784b542a00cf3be05cddc8aa7b6ce41c09f1791c696f69777ad810d97a7773ff222cb427e44ab1c8a70fa951e49a48efdfdada2373afe939a3248474df13acbcaee5e5ee725cf22e5e358bb9b4c09baf71656fd61576e4b71f174b5a172363cb91efeb6010bbb1cd0f700bf40e818d6d554ec2452eaa9dfbf7ed60cdec763246c85942a01aa182a5d816a425ae91147900b1f8678f8388ef529f3b96569985e32f0bdf648aa8c56e3f13a1820673009197fbb3a642547b7734190f44d56c7071b44c6974b631f2ffa97df73141371dec9e15ce36bab26ab39f854217340d04c5d2f5fd1e294173469d7da7bfbf374452210f380c114f3c44bee7cae5de47d6870902fbbc756cec78abc93b13ec49469f44931b11b0140d945bc625c397bdd0faad61fd3ba8da21ef9d8ea452a0e61829529e1e774749c707a743a55e65e5846a182dbe7c688ad26009e8a2805f39b433546da77f1f0b6316a1e7ca4ff502f2884212f6c6e5ca536dacbff218fb13dcdbc684d2e27bc6db754978d3c75e7cde2c9b057121196f473c70f9142926204e2a347c25ac3311c1a245dc29ef97f71c83043463c13d2cf64b57a10a174fdc72ad0bd6173f9cf172f3685a3e561dde851e0e703aed4d11c62f5307495c150de77f4e0fb73f157e4b8ec8a5b8975aa646e18a82533acc8ac72a07416f621058d99a416ebe937d67590158858ed5f0177405c1",
            "fv": "v3.2.0"
        },
        "headers": { "Content-Type": "application/json", "Referer": "https://wqs.jd.com" }
    }
    const resp = await user.post(options).json()
    if (resp?.data?.result) {
        const { tk, algo } = resp.data.result
        const _algo = new Function("return " + algo)()
        return { fp, tk, algo:_algo }
    } else { return {fp:null} } */
}

async function build_h5st(user) {
    const appId = "0f6ed"
    const { fp, tk, algo } = await request_algo(appId, user)
    const st = Date.now()
    const curtime = dateFmt(st)
    const sign = algo(tk, fp, curtime, appId, crypto).toString()
    // console.log(sign)
    const params = [
        { "key": "_t", "value": Date.now() }
    ]
    const paramsStr = params.map(({ key, value }) => key + ":" + value).join("&")
    const signedStr = crypto.HmacSHA256(paramsStr, sign).toString(crypto.enc.Hex) // S
    // console.log(signedStr)
    // var C = params.map(({ key }) => key).join(",")// C
    const i = '62f4d401ae05799f14989d31956d3c5f1404a6ddd7f9c752b0c42e8a2d139f8515cd3fb52ac1eb87d24b2b4b3d5690b5b0a6f083a973183731a13b27ea4d362c079fc081308b00270cc7134c5892bed9e2ae0aa950a3ea95aaac4b1eecb00185fea36624f6cdf44bc44164fae1e7c58652985a8b687d5603d83ad4ae0e0f5699483b44f549959a391c1866c5b6997e84b109ecbcc0fdb9a280028a57f70c3f43'
    const h5st = [curtime, fp, appId, tk, signedStr, "3.1", st, i].join(";")
    return h5st
}

