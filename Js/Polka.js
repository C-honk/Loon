let url = $request.url;
let body = $response.body;
let hasError = false;

function safeSet(obj, key, value) {
    try {
        if (obj?.[key] !== undefined) obj[key] = value;
    } catch (e) {
        hasError = true;
        console.log(`处理失败——>${key}`);
    }
}

try {
    let obj = JSON.parse(body);

    if (/api\/(ucenter\/users\/(pub|login)|advert\/free\/config)/.test(url)) {
        const expireTime = new Date('2099-09-09T09:09:00+08:00').getTime();
        let p = obj?.data?.payInfo;
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

        let u = obj?.data?.userInfo;
        safeSet(u, "status", 1);
        safeSet(u, "isVip", 1);
        safeSet(u, "vipType", 1);
        safeSet(u, "gender", 1);
        safeSet(u, "payVipType", 1);
        safeSet(u, "authType", 1);

        try { delete obj?.data?.allDayConfig?.fmRewards; } catch (e) { hasError = true; }
    } 
    else if (/api\/service\/global\/config\/scene/.test(url)) {
        safeSet(obj?.data, 'showShopEntry', false);
        safeSet(obj?.data, 'idolTabShow', false);
        safeSet(obj?.data, 'playingPageCollectPagList', []);
        safeSet(obj?.data, 'adsNotFinishVipPop4DayInterval', 9999);
        safeSet(obj?.data, 'AllDialogIntervals', 9999);
        safeSet(obj?.data?.warmStartDialog, 'count', 0);
        safeSet(obj?.data, 'offlineFavTipsGuide', 0);
        safeSet(obj?.data?.downLoadZoneConfig, 'freeTimeRemindTip', 0);
        safeSet(obj?.data?.iapNewConfig, 'enable', 0);
        safeSet(obj?.data?.iapConfig, 'enable', 0);
        safeSet(obj?.data, 'iosAudioSessionManager_ErrAlert', false);
    } 
    else if (/api\/service\/home\/index/.test(url)) {
        obj.data?.moduleList?.forEach((m, i, arr) => { if ([6, 2, 1, 8, 9].includes(m.type)) arr[i] = null; });
        if (obj.data?.moduleList) obj.data.moduleList = obj.data.moduleList.filter(Boolean);
    } 
    else if (/api\/play\/sound\/effect\/list/.test(url)) {
        obj.data?.list?.forEach(item => {
            safeSet(item, 'vipType', 'free');
            safeSet(item, 'audition', 0);
        });
    } 
    else if (/abtest\/ui\/info/.test(url)) {
        let map = obj?.data?.mapTestInfo;

        let downloadAd = map?.DownloadAd?.mapParams;
        let downloadAdios = map?.DownloadAdios?.mapParams;
        let wzDownloadAd = map?.WZDownloadAd?.mapParams;
        let downloadZoneOpt = map?.DownloadZoneOptimizationAZ?.mapParams;
        let adExpires = map?.adExpiresFreemodeShowad?.mapParams;
        let bdLaunchApp = map?.BDLaunchApp?.mapParams;
        let insertMod = map?.insert?.mapParams;
        let commentAD = map?.CommentADPosition?.mapParams;
        let discoverAD = map?.DiscoverADPosition?.mapParams;
        let clickView = map?.ClickView?.mapParams;
        let hongbao = map?.hongbao?.mapParams;
        let dynamicCoins = map?.Dynamiccoins?.mapParams;
        let wanliu = map?.Wanliu?.mapParams;
        let mvDialog = map?.bodianmvdialog?.mapParams;
        let voiceRemind = map?.FreeModVoiceReminder?.mapParams;
        let mvTry = map?.MvTryShowAds?.mapParams;

        let modules = [downloadAd, downloadAdios, wzDownloadAd, downloadZoneOpt, adExpires,
            bdLaunchApp, insertMod, commentAD, discoverAD, clickView, hongbao,
            dynamicCoins, wanliu, mvDialog, voiceRemind, mvTry];

        modules.forEach(mod => {
            if (mod) Object.keys(mod).forEach(key => safeSet(mod, key, "0"));
        });
    }

    body = JSON.stringify(obj);
} catch (e) {
    hasError = true;
}

$done({ body });
