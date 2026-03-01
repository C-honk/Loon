let url = $request.url;
let body = $response.body;
let log = [];

function safeSet(obj, key, value) {
    try {
        obj[key] = value;
    } catch (e) {
        log.push(`处理失败>>${key}`);
    }
}

try {
    if (/api\/(ucenter\/users\/(pub|login)|advert\/free\/config)/.test(url)) {
        let obj = JSON.parse(body);
        const expireTime = new Date('2099-09-09T09:09:00+08:00').getTime();

        let p = obj.data.payInfo;
        safeSet(p, "redFlower", 999);
        safeSet(p, "isSignedBoolean", true);
        safeSet(p, "isCtVipBoolean", true);
        safeSet(p, "isCtPayVipBoolean", false);
        safeSet(p, "ctExpireDate", expireTime);
        safeSet(p, "isVip", 1);
        safeSet(p, "signedCount", 999);
        safeSet(p, "isVipBoolean", true);
        safeSet(p, "isBigVipBoolean", true);
        safeSet(p, "bigExpireDate", expireTime);
        safeSet(p, "ctPayExpireDate", 0);
        safeSet(p, "signType", 1);
        safeSet(p, "bigPayExpireDate", 0);
        safeSet(p, "actVipType", 0);
        safeSet(p, "vipType", 1);
        safeSet(p, "isBigPayVipBoolean", false);
        safeSet(p, "payExpireDate", expireTime);
        safeSet(p, "actExpireDate", expireTime);
        safeSet(p, "isActVipBoolean", true);
        safeSet(p, "isPayVipBoolean", true);
        safeSet(p, "lastOrderPrice", 0);
        safeSet(p, "lastOrderSigned", 0);
        safeSet(p, "payVipType", 1);
        safeSet(p, "isSigned", 1);
        safeSet(p, "expireDate", expireTime);

        let u = obj.data.userInfo;
        safeSet(u, "status", 1);
        safeSet(u, "isVip", 1);
        safeSet(u, "vipType", 1);
        safeSet(u, "gender", 1);
        safeSet(u, "payVipType", 1);
        safeSet(u, "authType", 1);

        try { delete obj.data.allDayConfig.fmRewards; } catch(e){ log.push("处理失败>>allDayConfig.fmRewards"); }

        body = JSON.stringify(obj);
    }
    else if (/api\/service\/global\/config\/scene/.test(url)) {
        let obj = JSON.parse(body);
        let d = obj.data;
        safeSet(d, "showShopEntry", false);
        safeSet(d, "idolTabShow", false);
        safeSet(d, "playingPageCollectPagList", []);
        safeSet(d, "adsNotFinishVipPop4DayInterval", 9999);
        safeSet(d, "AllDialogIntervals", 9999);
        safeSet(d.warmStartDialog, "count", 0);
        safeSet(d, "offlineFavTipsGuide", 0);
        safeSet(d.downLoadZoneConfig, "freeTimeRemindTip", 0);
        safeSet(d.iapNewConfig, "enable", 0);
        safeSet(d.iapConfig, "enable", 0);
        safeSet(d, "iosAudioSessionManager_ErrAlert", false);

        body = JSON.stringify(obj);
    }
    else if (/api\/service\/home\/index/.test(url)) {
        let obj = JSON.parse(body);
        obj.data.moduleList = obj.data.moduleList.filter(item => ![6,2,1,8,9].includes(item.type));
        body = JSON.stringify(obj);
    }
    else if (/api\/play\/sound\/effect\/list/.test(url)) {
        let obj = JSON.parse(body);
        let list = obj.data.list;
        for (let i = 0; i < list.length; i++) {
            safeSet(list[i], "vipType", 'free');
            safeSet(list[i], "audition", 0);
        }
        body = JSON.stringify(obj);
    }
    else if (/abtest\/ui\/info/.test(url)) {
        let obj = JSON.parse(body);
        let map = obj.data.mapTestInfo;
        let modules = [
            map.DownloadAd.mapParams,
            map.DownloadAdios.mapParams,
            map.WZDownloadAd.mapParams,
            map.DownloadZoneOptimizationAZ.mapParams,
            map.adExpiresFreemodeShowad.mapParams,
            map.BDLaunchApp.mapParams,
            map.insert.mapParams,
            map.CommentADPosition.mapParams,
            map.DiscoverADPosition.mapParams,
            map.ClickView.mapParams,
            map.hongbao.mapParams,
            map.Dynamiccoins.mapParams,
            map.Wanliu.mapParams,
            map.bodianmvdialog.mapParams,
            map.FreeModVoiceReminder.mapParams,
            map.MvTryShowAds.mapParams
        ];
        for (let mod of modules) {
            for (let key in mod) safeSet(mod, key, "0");
        }
        body = JSON.stringify(obj);
    }
} catch(e) {

}

$done({ body, log });
