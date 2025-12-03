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
    const nodeName = inputParams.node;
    const nodeAddress = inputParams.nodeInfo.address;

    let entryHtml = "";
    let landingHtml = "";
    let errorLogs = [];

    try {
        const entryIp = await resolveNodeIP(nodeAddress);
        const entryInfo = await queryEntryIP(entryIp);
        const decodedEntryInfo = decodeEntryInfo(entryInfo?.data);

        if (decodedEntryInfo) {
            entryHtml = 
                `IP：${entryIp}<br>` +
                `位置：${decodedEntryInfo.city || decodedEntryInfo.province || ""}<br>` +
                `运营：${decodedEntryInfo.isp || decodedEntryInfo.operator || ""}<br>`;
        } else {
            errorLogs.push("入口查询失败");
        }
    } catch {
        errorLogs.push("入口查询失败");
    }

    try {
        const landingInfo = await queryIPInfo("http://ipinfo.io/json");

        if (landingInfo?.ip) {
            let countryName = "";
            if (landingInfo.country && countryMap[landingInfo.country]) {
                countryName = countryMap[landingInfo.country];
            } else {
                countryName = landingInfo.country || landingInfo.region || "";
            }

            landingHtml = 
                `IP：${landingInfo.ip}<br>` +
                `位置：${countryName}<br>` +
                `${landingInfo.org ? `运营：${landingInfo.org.replace(/^AS\d+\s*/, "")}<br>` : ""}`;
        } else {
            errorLogs.push("落地查询失败");
        }
    } catch {
        errorLogs.push("落地查询失败");
    }

    let html = `
        <p style="text-align:center; font-family:-apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI'; font-size:16px; line-height:1.4;">
            <br>
            ${entryHtml ? `入口位置<br>${entryHtml}<br>` : ""}
            ${landingHtml ? `落地位置<br>${landingHtml}<br>` : ""}
            节点：${nodeName}<br>
            ${errorLogs.length ? `<br><span style="color:red;">${errorLogs.join("<br>")}</span>` : ""}
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
