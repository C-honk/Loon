let url = $request.url;
let body = $response.body;

if (/api\/(ucenter\/users\/(pub|login)|advert\/free\/config)/.test(url)) {
    try {
        let obj = JSON.parse(body);
        const expireTime = new Date('2099-09-09T09:09:00+08:00').getTime();

        let p = obj.data.payInfo;
        p.redFlower = 999;
        p.isSignedBoolean = true;
        p.isCtVipBoolean = true;
        p.isCtPayVipBoolean = false;
        p.ctExpireDate = expireTime;
        p.isVip = 1;
        p.signedCount = 999;
        p.isVipBoolean = true;
        p.isBigVipBoolean = true;
        p.bigExpireDate = expireTime;
        p.ctPayExpireDate = 0;
        p.signType = 1;
        p.bigPayExpireDate = 0;
        p.actVipType = 0;
        p.vipType = 1;
        p.isBigPayVipBoolean = false;
        p.payExpireDate = expireTime;
        p.actExpireDate = expireTime;
        p.isActVipBoolean = true;
        p.isPayVipBoolean = true;
        p.lastOrderPrice = 0;
        p.lastOrderSigned = 0;
        p.payVipType = 1;
        p.isSigned = 1;
        p.expireDate = expireTime;

        let u = obj.data.userInfo;
        u.status = 1;
        u.isVip = 1;
        u.vipType = 1;
        u.gender = 1;
        u.payVipType = 1;
        u.authType = 1;

        delete obj.data.allDayConfig.fmRewards;

        $done({ body: JSON.stringify(obj) });
    } catch (e) {
        console.log("[pub|login|free错误]：" + e);
        $done({ body });
    }
}

else if (/api\/service\/conf\/all/.test(url)) {
    try {
        let obj = JSON.parse(body);
        let g = obj.data.groupSign;

        g.adExitChange = 0;
        g.adGuideTest = 0;
        g.adStartAppDialog = 0;
        g.playTips = 0;
        g.freeDynamicChange = 0;

        $done({ body: JSON.stringify(obj) });
    } catch (e) {
        console.log("[conf/all错误]：" + e);
        $done({ body });
    }
}

else if (/api\/service\/global\/config\/scene/.test(url)) {
    try {
        let obj = JSON.parse(body);
        let d = obj.data;
        d.showShopEntry = false;
        d.idolTabShow = false;
        d.playingPageCollectPagList = [];
        d.adsNotFinishVipPop4DayInterval = 9999;
        d.AllDialogIntervals = 9999;
        d.warmStartDialog.count = 0;
        d.offlineFavTipsGuide = 0;
        d.downLoadZoneConfig.freeTimeRemindTip = 0;
        d.iapNewConfig.enable = 0;
        d.iapConfig.enable = 0;
        d.iosAudioSessionManager_ErrAlert = false;

        $done({ body: JSON.stringify(obj) });
    } catch (e) {
        console.log("[config/scene错误]：" + e);
        $done({ body });
    }
}

else if (/api\/service\/home\/index/.test(url)) {
    try {
        let obj = JSON.parse(body);
        let list = obj.data.moduleList;
        obj.data.moduleList = list.filter(item => ![6,2,1,8,9].includes(item.type));
        $done({ body: JSON.stringify(obj) });
    } catch (e) {
        console.log("[home/index错误]：" + e);
        $done({ body });
    }
}

else if (/api\/play\/sound\/effect\/list/.test(url)) {
    try {
        let obj = JSON.parse(body);
        let list = obj.data.list;
        for (let i = 0; i < list.length; i++) {
            list[i].vipType = 'free';
            list[i].audition = 0;
        }
        $done({ body: JSON.stringify(obj) });
    } catch (e) {
        console.log("[effect/list错误]：" + e);
        $done({ body });
    }
}

else if (/abtest\/ui\/info/.test(url)) {
    try {
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
            for (let key in mod) mod[key] = "0";
        }
        $done({ body: JSON.stringify(obj) });
    } catch (e) {
        console.log("[ui/info错误]：" + e);
        $done({ body });
    }
}

else {
    $done({ body });
}
