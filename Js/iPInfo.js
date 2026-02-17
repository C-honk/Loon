let shouldMask = $argument && $argument.includes("true");

const scriptName = "IP信息查询";

const maskIp = (ip) => {
    if (!shouldMask || !ip) return ip;
    if (ip.includes('.')) {
        return ip.replace(/\.(\d+)$/, (match, p1) => "." + "*".repeat(p1.length));
    }
    if (ip.includes(':')) {
        return ip.replace(/:([0-9a-fA-F]+)$/, (match, p1) => ":" + "*".repeat(p1.length));
    }
    return ip;
};

const countryMap = {
    "HK": "香港", "TW": "台湾", "KR": "韩国", "JP": "日本",
    "DE": "德国", "FR": "法国", "GB": "英国", "US": "美国",
    "SG": "新加坡", "AU": "澳大利亚", "CA": "加拿大", "RU": "俄罗斯",
    "IN": "印度", "IT": "意大利", "ES": "西班牙", "BR": "巴西",
    "NL": "荷兰", "CH": "瑞士", "SE": "瑞典", "NO": "挪威",
    "DK": "丹麦", "FI": "芬兰", "PL": "波兰", "UA": "乌克兰",
    "MX": "墨西哥", "AE": "阿联酋", "SA": "沙特阿拉伯", "TR": "土耳其",
    "AR": "阿根廷", "ZA": "南非", "NZ": "新西兰", "MY": "马来西亚",
    "TH": "泰国", "PH": "菲律宾", "VN": "越南", "ID": "印度尼西亚"
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
            const timer = setTimeout(() => reject(new Error("Timeout")), 5000);
            $httpClient.get({ url: "http://ipinfo.io/json", node: nodeName }, (err, resp, body) => {
                clearTimeout(timer);
                if (err) return reject(new Error("Failed"));
                try { resolve(JSON.parse(body)); } 
                catch { resolve({}); }
            });
        });

        if (landingInfo?.ip) {
            let countryName = countryMap[landingInfo.country] || landingInfo.country || landingInfo.region || "";
            landingHtml = 
                `IP：${maskIp(landingInfo.ip)}<br>` +
                `所在地：${countryName}<br>` +
                `${landingInfo.org ? `运营商：${landingInfo.org.replace(/^AS\d+\s*/, "")}<br>` : ""}`;
        }
    } catch (err) {
        errorLogs.push(`Landing: ${err.message}`);
    }

    try {
        let entryIp = nodeAddress;
        const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(nodeAddress) || /:/.test(nodeAddress);
        
        if (!isIp) {
            const dnsRes = await new Promise((resolve) => {
                $httpClient.get({ url: `http://223.5.5.5/resolve?name=${nodeAddress}&type=A&short=1` }, (err, resp, body) => {
                    if (err) resolve(null);
                    try { resolve(JSON.parse(body)); } catch { resolve(null); }
                });
            });
            if (dnsRes && dnsRes.length > 0) entryIp = dnsRes[0];
        }

        const entryInfo = await new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error("Timeout")), 5000);
            $httpClient.get({ url: `http://api-v3.speedtest.cn/ip?ip=${entryIp}`, node: "DIRECT" }, (err, resp, body) => {
                clearTimeout(timer);
                if (err) return reject(new Error("Failed"));
                try { resolve(JSON.parse(body)); } 
                catch { resolve({}); }
            });
        });

        if (entryInfo?.data) {
            const d = entryInfo.data;
            const isp = d.isp || d.operator || "";
            const location = (d.province || "") + (d.city || "");
            
            entryHtml = 
                `IP：${maskIp(entryIp)}<br>` +
                `所在地：${location}<br>` +
                `运营商：${isp}<br>`;
        }
    } catch (err) {
        errorLogs.push(`Entry: ${err.message}`);
    }

    const html = `
        <p style="text-align:center; font-family:-apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI'; font-size:16px; line-height:1.4;">
            <br>
            ${entryHtml ? `<span style="color:orange;">入口位置</span><br>${entryHtml}<br>` : ""}
            ${landingHtml ? `<span style="color:#007AFF;">落地位置</span><br>${landingHtml}<br>` : ""}
            选中 ➞ ${nodeName}<br>
            ${errorLogs.length ? `<br><span style="color:red;">${errorLogs.join("<br>")}</span>` : ""}
        </p>`;

    $done({ title: scriptName, htmlMessage: html });

})();
