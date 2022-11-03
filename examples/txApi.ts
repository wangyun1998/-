// @ts-ignore
import request from "request";
import fs from "fs";
import download from 'download';

// 下载文件
async function downloadFile(url: string, filename: string, res: any) {
  await download(encodeURI(url), "./file", { filename });
  await fs.readFile(`./file/${filename}`, (err, _data) => {
    if (err) {
      res({
        code: -1,
        msg: "存储失败"
      });
    } else {
      fs.stat(`./file/${filename}`, (_err, stats) => {
        let fileMb = Math.ceil(stats.size / 1024 / 1024);
        if (fileMb > 20) {
          microtiaVideo();
        } else {
          res({
            code: 200,
            msg: "存储文件成功"
          });
        }
      });
    }
  });

};

// 神回复
const godReplies = function () {
  return new Promise((resolve, _reject) => {
    let url = "https://v.api.aa1.cn/api/api-wenan-shenhuifu/index.php?aa1=json";

    request.get(url, function (error: any, _response: any, body: any) {
      if (error) {
        resolve("神回复请求出错");
        return;
      }
      let data = JSON.parse(body);
      let text = data[0].shenhuifu.replace("<br>", "\n\n");
      resolve(text);
    });
  });
};

// 每日英语
const dateEnglish = function () {
  return new Promise((resolve, reject) => {
    let url = "https://api.vvhan.com/api/en?type=sj";

    request.get(url, function (error: any, _response: any, body: any) {
      if (error) {
        resolve("每日英语请求出错");
        return;
      }
      let data = JSON.parse(body);
      if (data.success) {
        let { zh, en } = data.data;
        resolve(`${en}\n${zh}`);
      } else {
        console.log("请求失败！" + reject);
        resolve("你在说什么，我听不懂");
      }
    });
  });
};

// 热搜
const hotSearch = function () {
  return new Promise((resolve, reject) => {
    let url = "https://v.api.aa1.cn/api/topbaidu/";

    request.get(url, function (error: any, _response: any, body: any) {
      if (error) {
        resolve("热搜请求出错");
        return;
      }
      let data = JSON.parse(body);
      if (data.code == 200) {
        let item =
          data.newslist[Math.floor(Math.random() * data.newslist.length)];
        let content = `标题：${item.title}\n热搜度：${item.hotnum}\n内容：${item.digest}`;
        resolve(content);
      } else {
        console.log("请求失败！" + reject);
        resolve("你在说什么，我听不懂");
      }
    });
  });
};

// 绕口令
const tongueTwister = function (params: any) {
  return new Promise((resolve, reject) => {
    let url = "http://api.tianapi.com/rkl/index?" + params;

    request.get(url, function (error: any, _response: any, body: any) {
      if (error) {
        resolve("请求出错");
        return;
      }
      let data = JSON.parse(body);
      if (data.code == 200) {
        data.newslist[0].content = data.newslist[0].content.replace(
          /<br\/>/g,
          "\n"
        );
        resolve(data.newslist[0].content);
      } else {
        console.log("请求失败！" + reject);
        resolve("你在说什么，我听不懂");
      }
    });
  });
};

// 自动回复
const robotSay = function (params: any) {
  return new Promise((resolve, reject) => {
    let url =
      "https://api.ownthink.com/bot?appid=xiaosi&userid=user&spoken=" + params;
    request.get(url, function (error: any, _response: any, body: any) {
      if (error) {
        resolve("请求出错");
        return;
      }
      let data = JSON.parse(body);
      if (data.message == "success") {
        let text = data.data.info.text;
        resolve(text);
      } else {
        console.log("请求失败！" + reject);
        resolve("你在说什么，我听不懂");
      }
    });
  });
};

// 探讨人生
const callSB = function (params: string) {
  return new Promise((resolve, _reject) => {
    let url = `https://fun.886.be/api.php${params != "" ? "?level=max" : ""}`;
    request.get(url, function (err: any, _res: any, body: any) {
      if (err) {
        resolve("请求出错");
        return;
      }
      resolve(body);
    });
  });
};

// 网络热词
const hotWords = function (params: any) {
  return new Promise((resolve, _reject) => {
    let url = "https://lab.magiconch.com/api/nbnhhsh/guess";
    request.post(
      url,
      { body: params, json: true },
      function (err: any, _res: any, body: any) {
        if (!err && body[0] && body[0].trans && body[0].trans.length > 0) {
          let newStr = `${params.text}的意思有\n`;
          body[0].trans.map((item: string, index: number) => {
            newStr += `${item}${index <= body[0].trans.length ? "\n" : ""}`;
          });
          resolve(newStr);
        } else {
          return;
        }
      }
    );
  });
};

// 每日天气
const dailyWeather = function (params: string) {
  return new Promise((resolve, _reject) => {
    request.get(
      `https://api.qqsuu.cn/api/dm-tianqi?city=${params}`,
      function (err: any, _res: any, body: any) {
        if (err) {
          resolve("天气请求出错");
          return;
        } else {
          resolve(JSON.parse(body));
        }
      }
    );
  });
};

// 摸鱼人日历
const getCalendar = function () {
  return new Promise((resolve, _reject) => {
    request.get(
      "https://api.vvhan.com/api/moyu",
      function (err: any, res: any, _body: any) {
        if (err) {
          resolve("日历请求出错");
          return;
        } else {
          resolve(res.request.uri.href);
        }
      }
    );
  });
};

// 视频
const getVideo = function () {
  return new Promise((resolve, _reject) => {
    request.get(
      "https://v.api.aa1.cn/api/api-dy-girl/index.php?aa1=json",
      function (err: any, _res: any, body: any) {
        if (err) {
          console.log(err);
          resolve("视频请求出错");
          return;
        } else {
          body = JSON.parse(body.split("</html>")[1].replace("\n", ""));
          if (body.result == 200) {
            downloadFile(body.mp4.split("//")[1], "1.mp4", resolve);
          } else {
            resolve("视频请求出错");
          }
        }
      }
    );
  });
};

// 发送邮件
const sendEmails = function (params: string) {
  return new Promise((resolve, _reject) => {
    request(
      `https://v.api.aa1.cn/api/mail/t/api.php?${params}`,
      (err: any, _res: any, body: any) => {
        if (err) {
          resolve("发送邮件出错");
          return;
        } else {
          resolve(body);
        }
      }
    );
  });
};

// 诗词问答
const poetryQuestion = function () {
  return new Promise((resolve, reject) => {
    let url =
      "http://api.tianapi.com/scwd/index?key=a3374dea7dbba6291b1cd3c801fa4199";

    request.get(url, function (error: any, _response: any, body: any) {
      if (error) {
        resolve("诗词问答请求出错");
        return;
      }
      let data = JSON.parse(body);
      if (data.code == 200) {
        resolve(data.newslist[0]);
      } else {
        console.log("请求诗词问答失败！" + reject);
        resolve("你在说什么，我听不懂");
      }
    });
  });
};

// 情感语录
const emotionalQuotation = function () {
  return new Promise((resolve, _reject) => {
    let url = "https://v.api.aa1.cn/api/api-wenan-qg/index.php?aa1=json";

    request.get(url, function (error: any, _response: any, body: any) {
      if (error) {
        resolve("情感语录请求出错");
        return;
      }
      let data = JSON.parse(body);
      resolve(data[0].qinggan);
    });
  });
};

// 毒鸡汤
const poisonChickenSoup = function () {
  return new Promise((resolve, _reject) => {
    let url = "https://v.api.aa1.cn/api/api-wenan-dujitang/index.php?aa1=json";

    request.get(url, function (error: any, _response: any, body: any) {
      if (error) {
        resolve("毒鸡汤请求出错");
        return;
      }
      let data = JSON.parse(body);
      resolve(data[0].dujitang);
    });
  });
};

// 网易云音乐热评
const musicHotMsg = function () {
  return new Promise((resolve, _reject) => {
    let url =
      "https://v.api.aa1.cn/api/api-wenan-wangyiyunreping/index.php?aa1=json";

    request.get(url, function (error: any, _response: any, body: any) {
      if (error) {
        resolve("网易云音乐热评请求出错");
        return;
      }
      let data = JSON.parse(body);
      resolve(data[0].wangyiyunreping);
    });
  });
};

// 壁纸
const wallPaper = function () {
  return new Promise((resolve, _reject) => {
    let url = "https://v.api.aa1.cn/api/api-meiribizhi/api.php";

    request.get(url, function (error: any, _response: any, body: any) {
      if (error) {
        resolve("壁纸请求出错");
        return;
      }
      let data = JSON.parse(body);
      if (data.errno * 1 != 0) {
        resolve("不好意思,后台有点小问题...请联系管理员处理");
      } else {
        let item = data.data[Math.floor(Math.random() * data.data.length)];
        resolve(item);
      }
    });
  });
};

// 星座运势
const getConstellation = function (item: object) {
  return new Promise((resolve, _reject) => {
    let url = `https://api.vvhan.com/api/horoscope?type=${(item as any).type
      }&time=${(item as any).time}`;
    request.get(url, function (error: any, _response: any, body: any) {
      if (error) {
        resolve("星座运势请求出错");
        return;
      }
      let getData = JSON.parse(body);
      let { success, data } = getData;
      if (success) {
        let res = `${data.title}\n综合运势：${data.fortune.all}\n运势解析:${data.fortunetext.all
          }\n\n爱情运势：${data.fortune.love}\n运势解析：${data.fortunetext.love
          }\n\n学业工作：${data.fortune.work}\n运势解析:${data.fortunetext.work
          }\n\n财富运势：${data.fortune.money}\n运势解析:${data.fortunetext.money
          }${data.luckycolor ? "\n\n幸运颜色：" + data.luckycolor : ""}${data.luckynumber ? "\n幸运数字：" + data.luckynumber : ""
          }${data.luckyconstellation
            ? "\n速配星座：" + data.luckyconstellation
            : ""
          }`;
        resolve(res);
      } else {
        resolve("不好意思,后台有点小问题...请联系管理员处理");
      }
    });
  });
};

// 笑话
const getJoke = function () {
  return new Promise((resolve, _reject) => {
    let url = "https://api.vvhan.com/api/joke?type=json";

    request.get(url, function (error: any, _response: any, body: any) {
      if (error) {
        resolve("笑话请求出错");
        return;
      }
      let data = JSON.parse(body);
      if (data.success) {
        resolve(`《${data.title}》\n${data.joke}`);
      } else {
        resolve("不好意思,后台有点小问题...请联系管理员处理");
      }
    });
  });
};

// 风景图
const landscapeMap = function () {
  return new Promise((resolve, _reject) => {
    let url = "https://api.vvhan.com/api/view?type=json";

    request.get(url, function (error: any, _response: any, body: any) {
      if (error) {
        resolve("风景图请求出错");
        return;
      }
      let data = JSON.parse(body);
      if (data.success) {
        resolve(data.imgurl);
      } else {
        resolve("不好意思,后台有点小问题...请联系管理员处理");
      }
    });
  });
};

// 成语接龙
const idiomSolitaire = function (params: any) {
  return new Promise((resolve, _reject) => {
    let url = `http://api.tianapi.com/chengyujielong/index?key=a3374dea7dbba6291b1cd3c801fa4199&word=${params.word}&userid=${params.userid}`;

    request.get(url, function (error: any, _response: any, body: any) {
      if (error) {
        resolve("风景图请求出错");
        return;
      }
      let data = JSON.parse(body);
      if (data.code == 200) {
        resolve(data.newslist[0]);
      } else {
        resolve("不好意思,后台有点小问题...请联系管理员处理");
      }
    });
  });
};

// 头像
const headPortrait = function (params: string) {
  return new Promise((resolve, _reject) => {
    let url = `https://api.vvhan.com/api/avatar?class=${params}`;

    request.get(url, function (error: any, response: any, _body: any) {
      if (error) {
        resolve("头像请求出错");
        return;
      }
      resolve(response.request.uri.href);
    });
  });
};

// 准点报时
const reportTime = function (params: string) {
  return new Promise((resolve, _reject) => {
    let url = `https://v.api.aa1.cn/api/api-baoshi/index.php?msg=${params}`;

    request.get(url, function (error: any, _response: any, body: any) {
      if (error) {
        resolve("准点报时请求出错");
        return;
      }
      downloadFile(body, "1.mp3", resolve);
    });
  });
};

// 健康小提示
const healthyTips = function () {
  return new Promise((resolve, _reject) => {
    let url = "https://api.qqsuu.cn/api/dm-healthtip";

    request.get(url, function (error: any, _response: any, body: any) {
      if (error) {
        resolve("健康小提示请求出错");
        return;
      }
      let data = JSON.parse(body);
      if (data.code == 1) {
        resolve(data.data[0].content);
      } else {
        resolve("不好意思,后台有点小问题...请联系管理员处理");
      }
    });
  });
};

// 猜灯谜
const lanternRiddles = function () {
  return new Promise((resolve, _reject) => {
    let url = "https://api.qqsuu.cn/api/dm-caidmi";

    request.get(url, function (error: any, _response: any, body: any) {
      if (error) {
        resolve("猜灯谜请求出错");
        return;
      }
      let data = JSON.parse(body);
      console.log(data);
      if (data.code == 1) {
        resolve(data.data[0]);
      } else {
        resolve("不好意思,后台有点小问题...请联系管理员处理");
      }
    });
  });
};

// 彩虹屁
const rainbowFart = function () {
  return new Promise((resolve, _reject) => {
    let url = "https://api.qqsuu.cn/api/dm-caihongpi";

    request.get(url, function (error: any, _response: any, body: any) {
      if (error) {
        resolve("彩虹屁请求出错");
        return;
      }
      let data = JSON.parse(body);
      if (data.code == 1) {
        resolve(data.data[0].content);
      } else {
        resolve("不好意思,后台有点小问题...请联系管理员处理");
      }
    });
  });
};

// 疫情查询
const epidemicSituation = function (params: string) {
  return new Promise((resolve, _reject) => {
    let url = `https://v.api.aa1.cn/api/api-yq/index.php?city=${params}`;

    request.get(url, function (error: any, _response: any, body: any) {
      if (error) {
        resolve("疫情查询请求出错");
        return;
      }
      let data = JSON.parse(body);
      if (data.region) {
        resolve(data);
      } else {
        resolve("不好意思,后台有点小问题...请联系管理员处理");
      }
    });
  });
};

// 舔狗
const flattererDog = function () {
  return new Promise((resolve, _reject) => {
    let url = `https://v.api.aa1.cn/api/tiangou/txt.php?aa1=text`;

    request.get(url, function (error: any, _response: any, body: any) {
      if (error) {
        resolve("舔狗语录请求出错");
        return;
      }
      body = body.replace("<p>", "").replace("</p>", "");
      resolve(body);
    });
  });
};

// 骚话
const obsceneRemarks = function () {
  return new Promise((resolve, _reject) => {
    let url = "https://v.api.aa1.cn/api/api-saohua/index.php?type=json";

    request.get(url, function (error: any, _response: any, body: any) {
      if (error) {
        resolve("骚话请求出错");
        return;
      }
      let data = JSON.parse(body);
      resolve(data.saohua);
    });
  });
};

// 微视
const microtiaVideo = function () {
  return new Promise((resolve, _reject) => {
    request.get(
      "https://v.api.aa1.cn/api/api-vs/index.php",
      function (err: any, _res: any, body: any) {
        if (err) {
          console.log(err);
          resolve("视频请求出错");
          return;
        } else {
          body = body.split("'url':'")[1].replace("\n", "").split("'}</pre>")[0];
          if (body) {
            downloadFile(body, "2.mp4", resolve);
          } else {
            resolve("视频请求出错");
          }
        }
      }
    );
  });
};

// 抖音视频
const TiktokVideo = function () {
  return new Promise((resolve, _reject) => {
    request.get(
      "https://v.api.aa1.cn/api/api-girl-11-02/index.php?type=json",
      function (err: any, _res: any, body: any) {
        if (err) {
          console.log(err);
          resolve("视频请求出错");
          return;
        } else {
          console.log(body);
        }
      }
    );
  });
};

export {
  godReplies,
  dateEnglish,
  hotSearch,
  robotSay,
  tongueTwister,
  callSB,
  hotWords,
  dailyWeather,
  getCalendar,
  getVideo,
  sendEmails,
  poetryQuestion,
  emotionalQuotation,
  poisonChickenSoup,
  musicHotMsg,
  wallPaper,
  getConstellation,
  getJoke,
  landscapeMap,
  idiomSolitaire,
  headPortrait,
  reportTime,
  healthyTips,
  lanternRiddles,
  rainbowFart,
  epidemicSituation,
  flattererDog,
  obsceneRemarks,
  microtiaVideo,
  TiktokVideo
};
