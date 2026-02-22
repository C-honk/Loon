let url = $request.url;
let body = $response.body;

if (/youth\/v1\/ab\/tmeab\?ab_source=TMEAB0WelcomePage0type/.test(url)) {
    try {
        let obj = JSON.parse(body);
        function cleanBasicUI(data) {
            for (let key in data) {
                let module = data[key];
                if (!module || !module.mapParams) continue;
                let params = module.mapParams;
                if ([
                    'TMEAB0WelcomePage0type',
                    'TMEAB0RECsources0type',
                    'newsongradio',
                    'soundeffect',
                    'importlist',
                    'TMEAB0OfflineH5'
                ].includes(key)) {
                    for (let p of ['show','is_show','sound_effect_show','guideanimation','is_on']) {
                        if (p in params) params[p] = "0";
                    }
                }
                if (key === 'TMEAB0TaskCenterEnter0type') {
                    for (let p of ['TFC','style','TaskDone','mypage']) params[p] = "0";
                }
                if (key === 'TMEAB0EarningTab0type') {
                    for (let p of ['Earning_Tab','Animation']) params[p] = "0";
                }
                if (key === 'TMEAB0FreemiumModelTouchpoint0type') {
                    for (let p in params) params[p] = "0";
                }
                if (['TMEAB0signin0type','TMEAB0freesignin0type'].includes(key)) {
                    for (let p in params) params[p] = "0";
                }
                if (key === 'defaultpic') {
                    params.defaultpic = "0";
                }
            }
        }
        cleanBasicUI(obj.data);
        body = JSON.stringify(obj);
    } catch (e) {
        console.log("处理失败 " + e.message);
    }
}

if (/youth\/v1\/ab\/tmeab\?ab_source=ysenter/.test(url)) {
    try {
        let obj = JSON.parse(body);
        function cleanAllAds(data) {
            for (let key in data) {
                let module = data[key];
                if (!module || !module.mapParams) continue;
                let params = module.mapParams;
                for (let p in params) params[p] = "0";
                if ([
                    'SelfpageUI',
                    'ExplorePageV5',
                    'MusicHall',
                    'TMEAB0landscapemode0type'
                ].includes(key)) {
                    data[key] = [];
                }
                if ([
                    'cube',
                    'SearchListV2',
                    'changtingdaily',
                    'ringtone',
                    'collect'
                ].includes(key)) {
                    for (let p in params) params[p] = "0";
                }
            }
        }
        cleanAllAds(obj.data);
        body = JSON.stringify(obj);
    } catch (e) {
        console.log("处理失败 " + e.message);
    }
}

$done({ body });
