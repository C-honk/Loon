/*
脚本说明：
- 默认显示完整 IP。
- 可通过 $environment.args.hideIP 控制是否隐藏 IP：
  hideIP = true  → 隐藏 IP（最后一段数字用 *）
  hideIP = false → 显示完整 IP（默认）
*/

const scriptName = "节点信息查询";

const countryMap = {
    "HK": "香港",
    "TW": "台湾",
    "KR": "韩国",
    "JP": "日本",
    "DE": "德国",
    "FR": "法国",
    "GB": "英国",
    "US": "美国"
};

(async () => {
    const inputParams = $environment.params;
    const args = $environment.args || {};
    const hideIP = args.hideIP === true; // 参数控制隐藏 IP，默认不隐藏

    const nodeName = inputParams.node;
    const nodeAddress = inputParams.nodeInfo.address;

    let entryHtml = "";
    let landingHtml = "";
    let hasSuccess = false;
    let errorLogs = [];

    try {
        const entryIp = await resolveNodeIP(nodeAddress);
        const entryInfo = await queryEntryIP(entryIp);
        const decodedEntryInfo = decodeEntryInfo(entryInfo?.data);

        if (decodedEntryInfo) {
            hasSuccess = true;
            entryHtml = 
                `IP：${hideIP ? entryIp.replace(/\d+$/, "*") : entryIp}<br>` +
                `位置：${decodedEntryInfo.city || decodedEntryInfo.province || ""}<br>` +
                `运营：${decodedEntryInfo.isp || decodedEntryInfo.operator || ""}<br>`;
        } else {
            errorLogs.push("入口信息解析失败");
        }
    } catch (err) {
        errorLogs.push(`入口查询失败: ${err.message}`);
    }

    try {
        const landingInfo = await queryIPInfo("http://ipinfo.io/json");

        if (landingInfo?.ip) {
            hasSuccess = true;

            let countryName = "";
            if (landingInfo.country && countryMap[landingInfo.country]) {
                countryName = countryMap[landingInfo.country];
            } else {
                countryName = landingInfo.country || landingInfo.region || "";
            }

            const displayIP = hideIP ? landingInfo.ip.replace(/\d+$/, "*") : landingInfo.ip;

            landingHtml = 
                `IP：${displayIP}<br>` +
                `位置：${countryName}<br>` +
                `${landingInfo.org ? `运营：${landingInfo.org.replace(/^AS\d+\s*/, "")}<br>` : ""}`;
        } else {
            errorLogs.push("落地解析失败");
        }
    } catch (err) {
        errorLogs.push(`落地查询失败: ${err.message}`);
    }

    if (!hasSuccess) {
        $done({
            title: scriptName,
            htmlMessage: `<p style="text-align:center;">入口和落地信息查询失败</p>
                          <p style="color:red;">错误记录:<br>${errorLogs.join("<br>")}</p>`
        });
        return;
    }

    let html = `
        <p style="text-align:center; font-family:-apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI'; font-size:16px; line-height:1.5;">
            <br>
            ${entryHtml ? `入口位置<br>${entryHtml}<br>` : ""}
            ${landingHtml ? `落地位置<br>${landingHtml}<br>` : ""}
            节点：${nodeName}<br>
            ${errorLogs.length ? `<br><span style="color:red;">错误记录:<br>${errorLogs.join("<br>")}</span>` : ""}
        </p>`;

    $done({ title: scriptName, htmlMessage: html });

})();

async function resolveNodeIP(addr) {
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(addr)) {
        return addr;
    }
    const res = await httpRequest(`http://223.5.5.5/resolve?name=${addr}&type=A&short=1`);
    return res[0];
}

async function queryEntryIP(nodeIp) {
    return await httpRequest(`http://api-v3.speedtest.cn/ip?ip=${nodeIp}`);
}

function decodeEntryInfo(data) {
    if (!data) return {};
    const decoded = {};

    for (let key in data) {
        if (typeof data[key] === "string") {
            try {
                decoded[key] = decodeURIComponent(escape(data[key]));
            } catch {
                decoded[key] = data[key];
            }
        } else {
            decoded[key] = data[key];
        }
    }

    return decoded;
}

async function queryIPInfo(url) {
    return await httpRequest(url);
}

async function httpRequest(url) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("请求超时")), 5000);

        $httpClient.get({ url }, (err, resp, body) => {
            clearTimeout(timer);
            if (err) return reject(err);
            resolve(JSON.parse(body));
        });
    });
}
