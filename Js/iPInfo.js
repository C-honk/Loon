const scriptName = "节点信息查询";
const countryMap = {
    "HK": "香港",
    "TW": "台湾",
    "KR": "韩国",
    "JP": "日本",
    "DE": "德国",
    "FR": "法国",
    "GB": "英国",
    "US": "美国",
    "SG": "新加坡",
    "AU": "澳大利亚",
    "CA": "加拿大",
    "RU": "俄罗斯",
    "IN": "印度",
    "IT": "意大利",
    "ES": "西班牙",
    "BR": "巴西",
    "NL": "荷兰",
    "CH": "瑞士",
    "SE": "瑞典",
    "NO": "挪威",
    "DK": "丹麦",
    "FI": "芬兰",
    "PL": "波兰",
    "UA": "乌克兰",
    "MX": "墨西哥",
    "AE": "阿联酋",
    "SA": "沙特阿拉伯",
    "TR": "土耳其",
    "AR": "阿根廷",
    "ZA": "南非",
    "NZ": "新西兰",
    "MY": "马来西亚",
    "TH": "泰国",
    "PH": "菲律宾",
    "VN": "越南",
    "ID": "印度尼西亚"
};

(async () => {
    const inputParams = $environment.params;
    const nodeName = inputParams.node;
    let nodeAddress = inputParams.nodeInfo.address;

    let entryHtml = "";
    let landingHtml = "";
    let errorLogs = [];

    try {
        const landingInfo = await new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error("请求超时")), 5000);
            $httpClient.get({ url: "http://ipinfo.io/json", node: nodeName }, (err, resp, body) => {
                clearTimeout(timer);
                if (err) return reject(new Error("请求失败：" + err.message));
                try { resolve(JSON.parse(body)); } 
                catch { resolve({}); }
            });
        });

        if (landingInfo?.ip) {
            let countryName = "";
            if (landingInfo.country && countryMap[landingInfo.country]) {
                countryName = countryMap[landingInfo.country];
            } else {
                countryName = landingInfo.country || landingInfo.region || "";
            }

            landingHtml = 
                `IP：${landingInfo.ip}<br>` +
                `所在地：${countryName}<br>` +
                `${landingInfo.org ? `运营商：${landingInfo.org.replace(/^AS\d+\s*/, "")}<br>` : ""}`;
        }
    } catch (err) {
        errorLogs.push(`落地：${err.message}`);
    }

    try {
        let entryIp = nodeAddress;
        if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(nodeAddress)) {
            const res = await new Promise((resolve, reject) => {
                const timer = setTimeout(() => reject(new Error("DNS解析超时")), 5000);
                $httpClient.get({ url: `http://223.5.5.5/resolve?name=${nodeAddress}&type=A&short=1` }, (err, resp, body) => {
                    clearTimeout(timer);
                    if (err) return reject(new Error("DNS请求失败：" + err.message));
                    try { resolve(JSON.parse(body)); } 
                    catch { resolve([]); }
                });
            });
            if (res?.length > 0) entryIp = res[0];
            else errorLogs.push("无法解析IP");
        }

        const entryInfo = await new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error("请求超时")), 5000);
            $httpClient.get({ url: `http://api-v3.speedtest.cn/ip?ip=${entryIp}` }, (err, resp, body) => {
                clearTimeout(timer);
                if (err) return reject(new Error("请求失败：" + err.message));
                try { resolve(JSON.parse(body)); } 
                catch { resolve({}); }
            });
        });

        if (entryInfo?.data) {
            const decoded = {};
            for (let key in entryInfo.data) {
                if (typeof entryInfo.data[key] === "string") {
                    try { decoded[key] = decodeURIComponent(escape(entryInfo.data[key])); } 
                    catch { decoded[key] = entryInfo.data[key]; }
                } else {
                    decoded[key] = entryInfo.data[key];
                }
            }

            entryHtml = 
                `IP：${entryIp}<br>` +
                `所在地：${decoded.city || decoded.province || ""}<br>` +
                `运营商：${decoded.isp || decoded.operator || ""}<br>`;
        }
    } catch (err) {
        errorLogs.push(`入口：${err.message}`);
    }

    const html = `
        <p style="text-align:center; font-family:-apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI'; font-size:16px; line-height:1.1;">
            <br>
            ${entryHtml ? `<span style="color:orange;">入口位置</span><br>${entryHtml}<br>` : ""}
            ${landingHtml ? `<span style="color:#0AA1FF;">落地位置</span><br>${landingHtml}<br>` : ""}
            选中 ➞ ${nodeName}<br>
            ${errorLogs.length ? `<br><span style="color:red;">${errorLogs.join("<br>")}</span>` : ""}
        </p>`;

    $done({ title: scriptName, htmlMessage: html });

})();
