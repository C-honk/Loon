const scriptName = "节点IP查询";
(async () => {
    const inputParams = $environment.params;
    const nodeName = inputParams.node;
    let nodeAddress = inputParams.nodeInfo.address;

    let entryHtml = "";
    let landingHtml = "";
    let errorLogs = [];

    try {

        const startTime = Date.now();

        const landingInfo = await new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error("请求超时")), 5000);
            $httpClient.get({ url: "http://ipwho.is/?lang=zh-CN", node: nodeName }, (err, resp, body) => {
                clearTimeout(timer);
                if (err) return reject(new Error("请求失败：" + err.message));
                try { resolve(JSON.parse(body)); } 
                catch { resolve({}); }
            });
        });

        const latency = Date.now() - startTime;

        if (landingInfo?.success && landingInfo?.ip) {

            landingHtml =
                `<span style="color:#768EDD;">${landingInfo.ip}</span><br><br>` +
                `位置：${landingInfo.country || ""}<br>` +
                `运营：${landingInfo.connection?.isp || ""}<br>` +
                `延时：${latency} ms<br>`;
        }

    } catch (err) {
        errorLogs.push(`错误${err.message}`);
    }

    const html = `
    <p style="text-align:center; font-family:-apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI'; font-size:16px; line-height:1.5;">
        <br>
        ${landingHtml ? `${landingHtml}<br>` : ""}
        选中 ➞ ${nodeName}<br>
        ${errorLogs.length ? `<br><span style="color:red;">${errorLogs.join("<br>")}</span>` : ""}
    </p>`;

    $done({ title: scriptName, htmlMessage: html });

})();
