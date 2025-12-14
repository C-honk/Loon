// 2025.12.15

(async () => {

    const scriptName = "节点信息查询";
    const countryMap = {
        "HK":"香港","TW":"台湾","KR":"韩国","JP":"日本","DE":"德国","FR":"法国","GB":"英国","US":"美国",
        "SG":"新加坡","AU":"澳大利亚","CA":"加拿大","RU":"俄罗斯","IN":"印度","IT":"意大利","ES":"西班牙",
        "BR":"巴西","NL":"荷兰","CH":"瑞士","SE":"瑞典","NO":"挪威","DK":"丹麦","FI":"芬兰","PL":"波兰",
        "UA":"乌克兰","MX":"墨西哥","AE":"阿联酋","SA":"沙特阿拉伯","TR":"土耳其","AR":"阿根廷","ZA":"南非",
        "NZ":"新西兰","MY":"马来西亚","TH":"泰国","PH":"菲律宾","VN":"越南","ID":"印度尼西亚"
    };

    let arg = typeof $argument === "string" ? JSON.parse($argument) : $argument || {};
    const maskIP = arg.maskIP !== ; 

    function maskIp(ip) {
        if (!ip || !/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return ip;
        const parts = ip.split(".");
        return `${parts[0]}.${parts[1]}.-.-`;
    }

    // 获取响应 body
    let body = $response.body;
    let obj;
    try { obj = JSON.parse(body); } 
    catch { obj = {}; }

    const nodeName = obj.nodeName || "";
    let nodeAddress = obj.nodeInfo?.address || "";

    let entryHtml = "";
    let landingHtml = "";
    let errorLogs = [];

    // 获取落地信息
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
            let countryName = landingInfo.country && countryMap[landingInfo.country]
                ? countryMap[landingInfo.country]
                : landingInfo.country || landingInfo.region || "";

            const displayLandingIp = maskIP ? maskIp(landingInfo.ip) : landingInfo.ip;

            landingHtml = 
                `IP：${displayLandingIp}<br>` +
                `位置：${countryName}<br>` +
                `${landingInfo.org ? `运营：${landingInfo.org.replace(/^AS\d+\s*/, "")}<br>` : ""}`;
        }
    } catch (err) {
        errorLogs.push(`落地：${err.message}`);
    }

    // 获取入口信息
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

            const displayEntryIp = maskIP ? maskIp(entryIp) : entryIp;

            entryHtml = 
                `IP：${displayEntryIp}<br>` +
                `位置：${decoded.city || decoded.province || ""}<br>` +
                `运营：${decoded.isp || decoded.operator || ""}<br>`;
        }
    } catch (err) {
        errorLogs.push(`入口：${err.message}`);
    }

    // 生成 HTML
    const html = `
        <p style="text-align:center; font-family:-apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI'; font-size:16px; line-height:1.4;">
            <br>
            ${entryHtml ? `入口位置<br>${entryHtml}<br>` : ""}
            ${landingHtml ? `落地位置<br>${landingHtml}<br>` : ""}
            节点：${nodeName}<br>
            ${errorLogs.length ? `<br><span style="color:red;">${errorLogs.join("<br>")}</span>` : ""}
        </p>`;

    $done({ title: scriptName, htmlMessage: html });
})();
