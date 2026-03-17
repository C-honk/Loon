// 2026-3-17

const scriptName = "服务解锁检测";
(async () => {
    const inputParams = $environment.params;
    const nodeName = inputParams.node;

    const check = (url, successStatus = 200) => {
        return new Promise((resolve) => {
            const opt = { 
                url: url, 
                node: nodeName,
                headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" }
            };

            $httpClient.get(opt, (err, resp, body) => {
                if (err) return resolve({ text: "连接失败" });
                
                const status = resp.status;
                if (url.includes("netflix.com")) {
                    if (status === 200) return resolve({ text: "完整解锁" });
                    if (status === 404) return resolve({ text: "仅限自制剧" });
                    if (status === 403) return resolve({ text: "代理被封" });
                }
                if (url.includes("youtube.com/premium")) {
                    if (status === 200) {
                        if (body && body.includes("Premium is not available")) return resolve({ text: "地区不支持" });
                        if (body && !body.includes("Premium")) return resolve({ text: "仅限网页" });
                        return resolve({ text: "完整解锁" });
                    }
                }
                if (status === successStatus || (successStatus === 200 && status === 302)) {
                    if (url.includes("youtube.com/premium") && body && !body.includes("Premium")) {
                        resolve({ text: "仅限网页" });
                    } else {
                        resolve({ text: "已解锁" });
                    }
                } else if (status === 403) {
                    resolve({ text: "被屏蔽(403)" });
                } else if (status === 451) {
                    resolve({ text: "法律地区限制(451)" });
                } else {
                    resolve({ text: `不支持(${status})` });
                }
            });
        });
    };

    const [gpt, gemini, yt, nflx] = await Promise.all([
        check("https://chatgpt.com/robots.txt"),
        check("https://gemini.google.com/app"),
        check("https://www.youtube.com/premium"),
        check("https://www.netflix.com/title/80018499")
    ]);

    const html = `
    <p style="text-align:center; font-family:-apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI'; font-size:16px; line-height:1.2;">
        <br>
        <span style="color:#10a37f;">ChatGPT</span><br>
        ${gpt.text}<br><br>
        
        <span style="color:#4285F4;">Gemini</span><br>
        ${gemini.text}<br><br>

        <span style="color:#FF0000;">YouTube</span><br>
        ${yt.text}<br><br>

        <span style="color:#E50914;">Netflix</span><br>
        ${nflx.text}<br><br>

        选中 ➞ ${nodeName}<br>
    </p>`;

    $done({ 
        title: scriptName, 
        htmlMessage: html 
    });
})();
