// 2026-3-16

const scriptName = "节点信息查询";
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
            $httpClient.get({ url: "http://ipwho.is/?lang=zh-CN", node: nodeName }, (err, resp, body) => {
                clearTimeout(timer);
                if (err) return reject(new Error("请求失败：" + err.message));
                try { resolve(JSON.parse(body)); } 
                catch { resolve({}); }
            });
        });

        if (landingInfo?.success && landingInfo?.ip) {

            landingHtml =
                `IP：${landingInfo.ip}<br>` +
                `所在地：${landingInfo.country || ""}<br>` +
                `${landingInfo.connection?.isp ? `运营商：${landingInfo.connection.isp}<br>` : ""}`;
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
    <p style="text-align:center; font-family:-apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI'; font-size:16px; line-height:1.4;">
        <br>
        ${entryHtml ? `<span style="color:#FF993A;">入口位置</span><br>${entryHtml}<br>` : ""}
        ${landingHtml ? `<span style="color:#578BFF;">落地位置</span><br>${landingHtml}<br>` : ""}
        选中 ➞ ${nodeName}<br>
        ${errorLogs.length ? `<br><span style="color:red;">${errorLogs.join("<br>")}</span>` : ""}
    </p>`;

    $done({ title: scriptName, htmlMessage: html });

})();
