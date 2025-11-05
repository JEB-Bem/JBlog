import fs from 'fs';

const pre = "https://chrjeb.cn/";
const DOMAIN = "chrjeb.cn";
const BAIDU_DOMAIN = "www.chrjeb.cn";
const BING_KEY = "3063153736194bc28fa87a51a7a59d43";
const BAIDU_KEY = "xwuBBvzH3jeVwos8";

const res = await fetch(`https://${DOMAIN}/sitemap.txt`);
let old_sitemap = '';
if (res.ok) {
  old_sitemap = await res.text();
  // 首页会被剔除掉
  old_sitemap = old_sitemap.replaceAll(pre, '');
}

let old_urls = old_sitemap.split('\n');

let new_sitemap = fs.readFileSync('public/sitemap.txt', 'utf-8');
new_sitemap = new_sitemap.replaceAll(pre, '');

old_urls.forEach((element) => {
  new_sitemap = new_sitemap.replace(element, '');
});

let new_urls = new_sitemap.trim().split('\n');

let post_urls = [];
new_urls.forEach((new_url) => {
  if (new_url.trim()) {
    console.log("new_url: ", new_url);
    console.log(`正在将 ${pre}${new_url} 到 待添加列表...`);
    post_urls.push(`${pre}${new_url}`);
  }
});

if (post_urls) {
  // 给 Bing 推送
  /*
  try {
    console.log("开始更新 Bing...");
    const bing_res = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        host: DOMAIN,
        key: BING_KEY,
        keyLocation: "https://${DOMAIN}/${BING_KEY}.txt",
        urlList: post_urls,
      }),
    });

    console.log("✅ 请求已发送，响应状态信息：");
    console.log("status:", bing_res.status);
    console.log("statusText:", bing_res.statusText);

    // 打印响应头
    console.log("headers:");
    for (const [key, value] of bing_res.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    // 读取响应体
    const text = await bing_res.text();
    console.log("body:");
    console.log(text);

    // 逻辑判断
    if (bing_res.ok) {
      console.log("✅ Bing 更新成功");
    } else {
      console.error("❌ Bing 更新失败");
    }
  } catch (err) {
    console.error("🚨 网络或解析错误：", err.message);
  }*/
  // 给 Baidu 推送
  try {
    console.log("开始更新 Baidu...");
    const baidu_res = await fetch("http://data.zz.baidu.com/urls?site=https://${BAIDU_DOMAIN}&token=${BAIDU_KEY}", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
      body: post_urls.join("\n"),
    });

    console.log("✅ 请求已发送，响应状态信息：");
    console.log("status:", baidu_res.status);
    console.log("statusText:", baidu_res.statusText);

    // 打印响应头
    console.log("headers:");
    for (const [key, value] of baidu_res.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    // 读取响应体
    const body = await baidu_res.json();
    console.log("body:");
    console.log(body);

    // 逻辑判断
    if (bing_res.ok) {
      console.log("✅ Baidu 更新成功");
    } else {
      console.error("❌ Baidu 更新失败");
    }
  } catch (err) {
    console.error("🚨 网络或解析错误：", err.message);
  }
}
