const scriptName = "节点解锁查询";

const NF_URL = "https://www.netflix.com/title/81280792";
const YTB_URL = "https://www.youtube.com/premium";
const DISNEY_URL = "https://www.disneyplus.com";
const GPT_URL = "https://chat.openai.com/";
const GPT_REGION = "https://chat.openai.com/cdn-cgi/trace";

const inputParams = $environment.params;
const nodeName = inputParams.node;

let result = {
    Netflix: "",
    Disney: "",
    YouTube: "",
    ChatGPT: ""
};

function green(text) {
    return `<span style="color:#27ae60">${text}</span>`;
}

function yellow(text) {
    return `<span style="color:#f39c12">${text}</span>`;
}

function red(text) {
    return `<span style="color:#e74c3c">${text}</span>`;
}

Promise.all([
    nfTest(),
    disneyTest(),
    youtubeTest(),
    gptTest()
]).then(() => {

    const html = `
<p style="text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue','Segoe UI';font-size:16px;line-height:1.2;">
<br>
${result.Netflix}<br>
${result.Disney}<br>
${result.YouTube}<br>
${result.ChatGPT}<br>
<br>
选中 ➞ ${nodeName}
</p>`;

    $done({
        title: scriptName,
        htmlMessage: html
    });

}).catch(() => {
    $done({ title: scriptName });
});


/* Netflix 检测 */
function nfTest() {
    return new Promise(resolve => {

        $httpClient.get({
            url: NF_URL,
            node: nodeName,
            timeout: 6000
        }, (err, resp) => {

            if (err) {
                result.Netflix = `${red("检测失败")}：Netflix`;
                return resolve();
            }

            if (resp.status === 403) {
                result.Netflix = `${red("未支持")}：Netflix`;
            } else if (resp.status === 404) {
                result.Netflix = `${yellow("仅支持自制剧")}：Netflix`;
            } else if (resp.status === 200) {
                result.Netflix = `${green("完整支持")}：Netflix`;
            } else {
                result.Netflix = `${red("检测失败")}：Netflix`;
            }

            resolve();
        });

    });
}


/* Disney+ 检测 */
function disneyTest() {
    return new Promise(resolve => {

        $httpClient.get({
            url: DISNEY_URL,
            node: nodeName,
            timeout: 6000
        }, (err, resp) => {

            if (err) {
                result.Disney = `${red("检测失败")}：Disney+`;
            } else if (resp.status === 200) {
                result.Disney = `${green("支持")}：Disney+`;
            } else {
                result.Disney = `${red("未支持")}：Disney+`;
            }

            resolve();
        });

    });
}


/* YouTube Premium 检测 */
function youtubeTest() {
    return new Promise(resolve => {

        $httpClient.get({
            url: YTB_URL,
            node: nodeName,
            timeout: 6000
        }, (err, resp, data) => {

            if (err) {
                result.YouTube = `${red("检测失败")}：YouTube`;
                return resolve();
            }

            if (data.includes("Premium is not available")) {
                result.YouTube = `${red("未支持")}：YouTube`;
            } else {
                result.YouTube = `${green("支持")}：YouTube`;
            }

            resolve();
        });

    });
}


/* ChatGPT 检测 */
function gptTest() {
    return new Promise(resolve => {

        $httpClient.get({
            url: GPT_URL,
            node: nodeName,
            timeout: 6000,
            "auto-redirect": false
        }, (err) => {

            if (err) {
                result.ChatGPT = `${red("未支持")}：ChatGPT`;
                return resolve();
            }

            $httpClient.get({
                url: GPT_REGION,
                node: nodeName,
                timeout: 6000
            }, (e, r, data) => {

                if (e) {
                    result.ChatGPT = `${red("检测失败")}：ChatGPT`;
                } else {

                    let region = data.split("loc=")[1]?.split("\n")[0];

                    if (region) {
                        result.ChatGPT = `${green("支持")}：ChatGPT`;
                    } else {
                        result.ChatGPT = `${green("支持")}：ChatGPT`;
                    }
                }

                resolve();
            });

        });

    });
}
