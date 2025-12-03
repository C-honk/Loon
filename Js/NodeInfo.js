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
  try {
    const inputParams = $environment.params,
          nodeName = inputParams.node,
          nodeAddress = inputParams.nodeInfo.address;

    let entryHtml = "", landingHtml = "", hasSuccess = false;

    try {
      const entryIp = await resolveNodeIP(nodeAddress);
      const entryInfo = await queryEntryIP(entryIp);
      const decodedEntryInfo = decodeEntryInfo(entryInfo?.data);
      if (decodedEntryInfo?.ip) {
        hasSuccess = true;
        entryHtml = `<div style="margin-bottom:4px; color:#1c1c1e;">IP：${decodedEntryInfo.ip}</div>
                     <div style="margin-bottom:4px; color:#1c1c1e;">位置：${decodedEntryInfo.city || decodedEntryInfo.province}</div>
                     <div style="margin-bottom:4px; color:#1c1c1e;">运营：${decodedEntryInfo.isp || decodedEntryInfo.operator}</div>`;
      }
    } catch {}

    try {
      const landingInfo = await queryIPInfo("http://ipinfo.io/json");
      if (landingInfo?.ip) {
        hasSuccess = true;
        const maskedLandingIP = landingInfo.ip.replace(/\d+$/, "*");
        let countryName = landingInfo.country && countryMap[landingInfo.country] ? countryMap[landingInfo.country] : landingInfo.country || landingInfo.region || "";
        landingHtml = `<div style="margin-bottom:4px; color:#1c1c1e;">IP：${maskedLandingIP}</div>
                       <div style="margin-bottom:4px; color:#1c1c1e;">位置：${countryName}</div>
                       ${landingInfo.org ? `<div style="margin-bottom:4px; color:#1c1c1e;">运营：${landingInfo.org.replace(/^AS\d+\s*/, "")}</div>` : ""}`;
      }
    } catch {}

    if (!hasSuccess) {
      $done({ title: scriptName, htmlMessage: `<div style="font-family:-apple-system; text-align:center; color:#ff3b30;">入口和落地信息查询失败</div>` });
      return;
    }

    let html = `
      <div style="font-family:-apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI'; 
                  font-size:15px; line-height:1.5; color:#1c1c1e; background-color:#f2f2f7; 
                  padding:15px; border-radius:10px; text-align:left; max-width:400px; margin:auto;">
        <div style="height:12px;"></div>
        ${entryHtml ? `<div style="margin-bottom:12px;">入口IP${entryHtml}</div><div style="height:12px;"></div>` : ""}
        ${landingHtml ? `<div style="margin-bottom:12px;">落地IP${landingHtml}</div><div style="height:12px;"></div>` : ""}
        <div>
          <span style="font-weight:600; color:#1c1c1e;">选中节点：</span><span style="color:#1c1c1e;">${nodeName}</span>
        </div>
      </div>`;

    $done({ title: scriptName, htmlMessage: html });

  } catch (err) {
    $done({ title: scriptName, htmlMessage: `<div style="font-family:-apple-system; text-align:center; color:#ff3b30;">查询异常: ${err.message}</div>` });
  }
})();

async function resolveNodeIP(addr) {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(addr)) return addr;
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
    const timer = setTimeout(() => reject(new Error("请求超时")), 30000);
    $httpClient.get({ url }, (err, resp, body) => {
      clearTimeout(timer);
      if (err) return reject(err);
      resolve(JSON.parse(body));
    });
  });
}
