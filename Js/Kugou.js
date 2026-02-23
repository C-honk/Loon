let url = $request.url;
let body = $response.body;

try {
    let obj = JSON.parse(body);
    let data = obj?.data || {};

    try {
        if (/youth\/v1\/ab\/tmeab\?ab_source=TMEAB0WelcomePage0type/.test(url)) {

            if (data.TMEAB0TaskCenterEnter0type?.mapParams) {
                Object.keys(data.TMEAB0TaskCenterEnter0type.mapParams)
                    .forEach(k => data.TMEAB0TaskCenterEnter0type.mapParams[k] = "0");
            }
            if (data.TMEAB0EarningTab0type?.mapParams) {
                data.TMEAB0EarningTab0type.mapParams.Earning_Tab = "0";
                data.TMEAB0EarningTab0type.mapParams.Animation = "0";
            }
            if (data.TMEAB0OfflineH5?.mapParams) {
                data.TMEAB0OfflineH5.mapParams.is_on = "0";
            }
            if (data.TMEAB0signin0type?.mapParams) {
                Object.keys(data.TMEAB0signin0type.mapParams)
                    .forEach(k => data.TMEAB0signin0type.mapParams[k] = "0");
            }
            if (data.TMEAB0freesignin0type?.mapParams) {
                Object.keys(data.TMEAB0freesignin0type.mapParams)
                    .forEach(k => data.TMEAB0freesignin0type.mapParams[k] = "0");
            }
            if (data.newsongradio?.mapParams) data.newsongradio.mapParams.is_show = "0";
            if (data.importlist?.mapParams) data.importlist.mapParams.guideanimation = "0";
            if (data.aiwritesong?.mapParams) data.aiwritesong.mapParams.aiwritesong = "0";

            if (data.TMEAB0FreemiumModelTouchpoint0type?.mapParams) {
                Object.keys(data.TMEAB0FreemiumModelTouchpoint0type.mapParams)
                    .forEach(k => data.TMEAB0FreemiumModelTouchpoint0type.mapParams[k] = "0");
            }
            if (data.TMEAB0GNBad0splashexpcontrol?.mapParams) {
                data.TMEAB0GNBad0splashexpcontrol.mapParams.front_5s = "0";
            }
            if (data.TMEAB0fmBidding?.mapParams) {
                data.TMEAB0fmBidding.mapParams.allowRepeatRequest = "0";
                data.TMEAB0fmBidding.mapParams.rewardAdLocalCache = "0";
                data.TMEAB0fmBidding.mapParams.cacheCount = "0";
                data.TMEAB0fmBidding.mapParams.rewardReqInterval = "999999";
                data.TMEAB0fmBidding.mapParams.rewardRealTimeReqInterval = "999999";
            }
            if (data.emptyqueue?.mapParams) {
                data.emptyqueue.mapParams.recomend = "0";
            }
        }
    } catch (e) {
        console.log("error: " + e);
    }

    try {
        if (/youth\/v1\/ab\/tmeab\?ab_source=ysenter/.test(url)) {

            if (data["TMEAB0ad0type"]?.mapParams) {
                Object.keys(data["TMEAB0ad0type"].mapParams)
                    .forEach(k => data["TMEAB0ad0type"].mapParams[k] = "0");
            }
            if (data["TMEAB0FreemiumExposureFix0type"]?.mapParams) {
                Object.keys(data["TMEAB0FreemiumExposureFix0type"].mapParams)
                    .forEach(k => data["TMEAB0FreemiumExposureFix0type"].mapParams[k] = "0");
            }
            if (data["TMEAB0FreemiumExposureFix0typeV2"]?.mapParams) {
                Object.keys(data["TMEAB0FreemiumExposureFix0typeV2"].mapParams)
                    .forEach(k => data["TMEAB0FreemiumExposureFix0typeV2"].mapParams[k] = "0");
            }
            if (data["TMEAB0vipplay0type"]?.mapParams) {
                Object.keys(data["TMEAB0vipplay0type"].mapParams)
                    .forEach(k => data["TMEAB0vipplay0type"].mapParams[k] = "0");
            }

            if (data["cube"]?.mapParams) {
                data["cube"].mapParams.home_mode = "1";
                data["cube"].mapParams.play_page_mode = "1";
                data["cube"].mapParams.dig_mode = "1";
                data["cube"].mapParams.row_num = "3";
            }

            if (data["TMEAB0audition0type"]?.mapParams) {
                data["TMEAB0audition0type"].mapParams.secs = "3000";
            }
            if (data["TMEAB0vipcenter0type"]?.mapParams) {
                data["TMEAB0vipcenter0type"].mapParams.vipcenter_exposure = "0";
            }
            if (data["viphide"]?.mapParams) {
                data["viphide"].mapParams.song_mode_unvipsong = "0";
            }
        }
    } catch (e) {
        console.log("error: " + e);
    }

    $done({ body: JSON.stringify(obj) });
} catch (e) {
    console.log("error: " + e);
    $done({ body });
}
