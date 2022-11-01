import "dotenv/config.js";

import { Contact, Message, ScanStatus, WechatyBuilder, log } from "wechaty";

import qrcodeTerminal from "qrcode-terminal";

import { FileBox } from "file-box";

import schedule from "node-schedule";

import {
  godReplies,
  dateEnglish,
  hotSearch,
  robotSay,
  tongueTwister,
  callSB,
  hotWords,
  dailyWeather,
  getCalendar,
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
  flattererDog
} from "./txApi.js";

// 控制机器人开关
let bootOpen = false;
// 控制成语接龙开关
let userid: string = "",
  isStart = false,
  timer: any = null,
  time = 20;
// 控制诗词问答
let problem: any,
  answer = false,
  answerList = [];

// 灯谜答案
let lanternAnswer = "",
  lanternStart = false;

function onScan(qrcode: string, status: ScanStatus) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    const qrcodeImageUrl = [
      "https://wechaty.js.org/qrcode/",
      encodeURIComponent(qrcode)
    ].join("");
    log.info(
      "运行机器人",
      "请扫码: %s(%s) - %s",
      ScanStatus[status],
      status,
      qrcodeImageUrl
    );

    qrcodeTerminal.generate(qrcode, { small: true }); // show qrcode on console
  } else {
    log.info("运行机器人", "请再次扫码: %s(%s)", ScanStatus[status], status);
  }
}

function onLogin(user: Contact) {
  log.info("机器人已启动", "%s 登录", user);
}

// 定时任务函数
async function onTiming(name: string, time: string) {
  let contact: any =
    (await bot.Contact.find({ name })) || await bot.Contact.find({ alias: name });
  schedule.scheduleJob(contact.payload.id, time, () => {
    try {
      contact.say("要说的话");
    } catch (err) {
      console.log(err);
    }
  });
}

function onLogout(user: Contact) {
  log.info("机器人已退出", "%s 退出", user);
}

async function onMessage(msg: Message) {
  console.log(msg.talker().payload?.name + "---" + msg.text());
  // 群管理
  let room = await msg.room();
  let topic = room?.payload?.topic;

  // 开启定时任务
  if (/^#开启任务$/.test(msg.text()) && msg.self()) {
    onTiming("好友名", "0 30 9 * * *");//秒 分 时 周 月 年
  }

  // 撤回的消息
  if (msg.type() == 13) {
    const recalledMessage = await msg.toRecalled();
    console.log(`撤回的消息：${recalledMessage?.talker().name()}---${recalledMessage?.text()}`);
  }

  // 帮助
  if (/^#帮助$/.test(msg.text())) {
    let apiList = [
      "日历",
      "绕口令",
      "热搜",
      "神回复",
      "天气",
      "英语",
      "发送邮件",
      "诗词问答",
      "伤感语录",
      "毒鸡汤",
      "网易云热评",
      "壁纸",
      "星座运势",
      "讲个笑话",
      "风景图",
      "疫情查询",
      // "成语接龙" 未完善,
      "猜灯谜",
      "头像",
      "健康小提示",
      "准点报时",
      "舔狗"
    ],
      helpStr = "";
    for (let i = 0, leng = apiList.length; i < leng; i++) {
      helpStr += `${i + 1}、${apiList[i]}，命令：#${apiList[i] == "天气"
        ? apiList[i] + "(周)城市名"
        : apiList[i] == "头像"
          ? `${apiList[i]}(1：男头 2：女头 3：动漫 4：景物)`
          : apiList[i] == "疫情查询" ? `${apiList[i]}城市名`
            : apiList[i]
        }${i + 1 == leng ? "" : "\n"}`;
    }
    await msg.say(helpStr);
  }

  // 骂人
  if (/鞭策/.test(msg.text())) {
    let data;
    if (msg.text().indexOf("重点")) {
      data = await callSB("1");
    } else {
      data = await callSB("");
    }
    await msg.say(data as string);
  };


  // 舔狗语录
  if (/^#舔狗$/.test(msg.text())) {
    let data = await flattererDog();
    await msg.say(data as string);
  };

  // 全国疫情
  if (/^#疫情查询[\u4E00-\u9FA5\uF900-\uFA2D]{2,3}$/.test(msg.text())) {
    let data: any = await epidemicSituation(encodeURI(msg.text().split("#疫情查询")[1] as string));
    if (data.conNum && data.asymptomNum) {
      let { name, conNum, deathNum, cureNum, asymptomNum, updateTime } = data;
      await msg.say(`${name}疫情数据\n今日新增：${asymptomNum}\n累计确诊：${conNum}，累计死亡：${deathNum}，累计治愈：${cureNum.split(",")[0]}\n\n${updateTime}`);
    } else {
      await msg.say("抱歉未查询出该地区的疫情状况，(。・＿・。)ﾉI’m sorry~");
    }
  };

  // 彩虹屁
  if (msg.text().indexOf("夸") > -1 && !msg.self()) {
    let data = await rainbowFart();
    await msg.say(data as string);
  }

  // 猜灯谜
  if (/^#猜灯谜$/.test(msg.text())) {
    let data: any = await lanternRiddles();
    if (data instanceof Object) {
      lanternStart = true;
      let { riddle, answer, description, type } = data;
      lanternAnswer += `${answer}|${description}`;
      await msg.say(
        `谜语：${riddle}\n提示：${type}\n\n输入#灯谜答案\n即可查看谜底`
      );
    } else {
      await msg.say(data);
    }
  }
  if (msg.text() == lanternAnswer.split("|")[0] && lanternStart && !msg.self()) {
    msg.say("恭喜你，答对啦☺");
  } else if (lanternStart && !msg.self()) {
    msg.say("答错了，再想想😞")
  }
  if (/^#灯谜答案$/.test(msg.text())) {
    lanternStart = false;
    msg.say(
      `谜底：${lanternAnswer.split("|")[0]}\n详细描述：${lanternAnswer.split("|")[1]
      }`
    );
  }

  // 健康小提示
  if (/^#健康小提示$/.test(msg.text())) {
    let data = await healthyTips();
    await msg.say(`健康小提示：\n${data as string}`);
  }

  // 准点报时
  if (/^#准点报时$/.test(msg.text())) {
    let data = await reportTime(encodeURI(`${new Date().getHours()}:00`));
    await msg.say(data as string);
  }

  // 头像
  if (/^#头像\d$/.test(msg.text())) {
    let headText = [
      {
        cn: "男头",
        en: "nan"
      },
      {
        cn: "女头",
        en: "nv"
      },
      {
        cn: "动漫",
        en: "dm"
      },
      {
        cn: "景物",
        en: "jw"
      }
    ];
    let text = headText[(msg.text().split("#头像")[1] as any) * 1 - 1]?.en;
    let data = await headPortrait(encodeURI(text as string));
    await msg.say(FileBox.fromUrl(data as string));
  }

  // 成语接龙
  if (/^#!成语接龙$/.test(msg.text()) && !isStart) {
    userid = msg.talker().payload?.id as string;
    isStart = true;
    msg.say("成语接龙,游戏开始！\n注意：回答要带#号，您先出题");
  }
  if (
    msg.text() != "#成语接龙" &&
    /^#[\u4E00-\u9FA5\uF900-\uFA2D]{4}$/.test(msg.text()) &&
    isStart &&
    userid == msg.talker().payload?.id
  ) {
    if (timer) {
      clearInterval(timer);
      (timer = null), (time = 20);
    }
    let data = await idiomSolitaire({
      word: encodeURI(msg.text().split("#")[1] as string),
      userid
    });
    if ((data as any).chengyu) {
      await msg.say((data as any).chengyu);
      await msg.say("请作答,20秒倒计时");
      timer = setInterval(() => {
        if (time == 0) {
          clearInterval(timer);
          (isStart = false), (timer = null), (time = 20), (userid = "");
          msg.say("倒计时结束,你输了");
          return;
        }
        msg.say(time);
        time--;
      }, 1000);
    } else {
      await msg.say((data as any).tip + ",游戏结束。");
      (isStart = false), (timer = null), (time = 20), (userid = "");
    }
  }
  if (
    /^#结束成语接龙$/.test(msg.text()) &&
    isStart &&
    userid == msg.talker().payload?.id
  ) {
    isStart = false;
    userid = "";
    await msg.say("成语接龙游戏已结束");
  }

  // 风景图
  if (/^#风景图$/.test(msg.text())) {
    let data = await landscapeMap();
    await msg.say(FileBox.fromUrl(data as string));
  }

  // 笑话
  if (/^#讲个笑话$/.test(msg.text())) {
    let data = await getJoke();
    await msg.say(data as string);
  }

  // 星座运势
  let constellationList = [
    {
      cn: "白羊座",
      en: "aries"
    },
    {
      cn: "金牛座",
      en: "taurus"
    },
    {
      cn: "双子座",
      en: "gemini"
    },
    {
      cn: "巨蟹座",
      en: "cancer"
    },
    {
      cn: "狮子座",
      en: "leo"
    },
    {
      cn: "处女座",
      en: "virgo"
    },
    {
      cn: "天秤座",
      en: "libra"
    },
    {
      cn: "天蝎座",
      en: "scorpio"
    },
    {
      cn: "射手座",
      en: "sagittarius"
    },
    {
      cn: "摩羯座",
      en: "capricorn"
    },
    {
      cn: "水瓶座",
      en: "aquarius"
    },
    {
      cn: "双鱼座",
      en: "pisces"
    }
  ];
  let date = ["today", "nextday", "week", "month", "year"];
  if (/^#星座运势$/.test(msg.text())) {
    let text = "";
    constellationList.map((item, index) => {
      text += `${index + 1}、${item.cn}\n`;
    });
    text +=
      "输入格式：#星座数字(空格)日期数字(今：1，明：2，周：3，月：4，年：5)";
    msg.say(text);
  }
  if (/^#\d{1,2} \d$/.test(msg.text())) {
    let text: any = msg.text().split("#")[1];
    let data = await getConstellation({
      type: constellationList[text.split(" ")[0] * 1 - 1]?.en,
      time: date[text?.split(" ")[1] * 1 - 1] || 1
    });
    await msg.say(data as string);
  }

  // 壁纸
  if (/^#壁纸$/.test(msg.text())) {
    let data = await wallPaper();
    if (typeof data == "string") {
      msg.say(data);
    } else if (typeof data == "object") {
      msg.say(FileBox.fromUrl((data as any).url));
    } else {
      msg.say("出大问题了！");
    }
  }

  // 网易云热评
  if (/^#网易云热评$/.test(msg.text())) {
    let data = await musicHotMsg();
    await msg.say(data as string);
  }

  // 毒鸡汤
  if (/^#毒鸡汤$/.test(msg.text())) {
    let data = await poisonChickenSoup();
    await msg.say(data as string);
  }

  // 伤感语录
  if (/^#伤感语录$/.test(msg.text())) {
    let data = await emotionalQuotation();
    await msg.say(data as string);
  }

  // 诗词问答
  if (/^#诗词问答$/.test(msg.text()) && !answer) {
    let data = await poetryQuestion();
    problem = data;
    answer = true;
    await msg.say(
      `问题：${(data as any).question}\n#A:${(data as any).answer_a}\n#B:${(data as any).answer_b
      }\n#C:${(data as any).answer_c}`
    );
  }

  if (/^#[ABCabc]$/.test(msg.text()) && answer && problem) {
    if (
      (problem as any).answer == msg.text().split("#")[1]?.toLocaleUpperCase()
    ) {
      await msg.say(`回答正确\n${(problem as any).analytic}`);
      answer = false;
      problem = null;
      answerList = [];
    } else {
      if (answerList.length == 1) {
        await msg.say(
          `回答错误,正确答案是${(problem as any).answer},真蠢！\n${(problem as any).analytic
          }`
        );
        answer = false;
        problem = null;
        answerList = [];
        return;
      }
      answerList.push(msg.text());
      await msg.say("回答错误,再仔细想想");
    }
  }

  // 摸鱼人日历
  if (/^#日历$/.test(msg.text())) {
    let data = await getCalendar();
    await msg.say(FileBox.fromUrl(data as string));
  }

  // 绕口令
  if (/^#绕口令$/.test(msg.text())) {
    let data = await tongueTwister("key=a3374dea7dbba6291b1cd3c801fa4199");
    await msg.say(data as string);
  }

  // 热搜
  if (/^#热搜$/i.test(msg.text())) {
    let data = await hotSearch();
    await msg.say(data as string);
  }

  // 神回复
  if (/^#神回复$/.test(msg.text())) {
    let data = await godReplies();
    await msg.say(data as string);
  }

  // 每日天气
  if (
    /^#天气[\u4E00-\u9FA5\uF900-\uFA2D]{2,}/.test(msg.text()) &&
    !/^#天气[\u4E00-\u9FA5\uF900-\uFA2D]{2,}周/.test(msg.text())
  ) {
    let text = msg.text().split("#天气")[1];
    if (!text) {
      text = "广州";
    } else if (text.indexOf("周") > -1) {
      text = text.split("周")[1];
    }
    let data: any = await dailyWeather(encodeURI(text as string) as string);
    if (data.code == 1) {
      let {
        date,
        week,
        highest,
        lowest,
        wind,
        weather,
        windsc,
        tips,
        area,
        uv_index,
        real
      } = data.data[0];
      if (msg.text().indexOf("周") == -1) {
        await msg.say(
          `今天是${date.split("-")[0]}年${date.split("-")[1]}月${date.split("-")[2]
          }日，${week}。\n${area}${weather}，当前温度${real}，最高温度${highest}，最低温度${lowest}，${wind}风力${windsc}，紫外线强度${uv_index}级。\n温馨提醒：${tips}`
        );
      } else {
        let textStr = "";
        for (let i = 0, leng = data.data.length; i < leng; i++) {
          let {
            date,
            week,
            highest,
            lowest,
            wind,
            weather,
            windsc,
            tips,
            area,
            uv_index
          } = data.data[i];
          textStr += `${date.split("-")[0]}年${date.split("-")[1]}月${date.split("-")[2]
            }日，${week}\n${area}${weather}，最高温度${highest}，最低温度${lowest}，${wind} 风力${windsc}，紫外线强度${uv_index}级。\n温馨提醒：${tips}${i == leng - 1 ? "" : "\n\n"
            }`;
        }
        await msg.say(textStr);
      }
    }
  }
  
  // 英语
  if (/^#英语$/i.test(msg.text())) {
    let data = await dateEnglish();
    await msg.say(data as string);
  }

  // 发送邮件
  if (/^#发送邮件$/.test(msg.text())) {
    await msg.say(
      "请输入邮箱地址以及标题和内容,格式：邮箱地址(空格)标题(空格)内容"
    );
  }
  if (
    msg.text() != "" &&
    /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(
      msg.text().split("</a>")[0]?.split(">")[1] as string
    )
  ) {
    let text = msg.text().split(" ");
    let data: any = await sendEmails(
      `adress=${encodeURI(
        msg.text().split("</a>")[0]?.split(">")[1] as string
      )}&title=${encodeURI(text[3] as string)}&content=${encodeURI(
        text[4] as string
      )}`
    );
    let res = JSON.parse(data);
    if (res.Code == 1) {
      console.log(res);
      msg.say("邮件发送成功");
    }
  }

  // 关键词邀请进群
  if (/^#群名$/.test(msg.text()) && !msg.self()) {
    let contact: any = await bot.Contact.find({
      name: msg.talker()?.payload?.name
    });
    let room: any = await bot.Room.find({
      topic: "群名"
    });
    if (room) {
      try {
        await room.add(contact);
        await msg.say("已邀请进群");
      } catch (e) {
        console.error(e);
      }
    }
  }

  // 主动拉进群
  if (msg.text().indexOf("邀请") > -1 && msg.self() && topic == "群名") {
    let contact = await bot.Contact.find({
      name: msg.text().split("邀请")[1]
    }) || await bot.Contact.find({
      alias: msg.text().split("邀请")[1]
    });
    let room: any = await bot.Room.find({
      topic: "群名"
    });
    if (room) {
      try {
        await room.add(contact);
        await msg.say("已邀请进群");
      } catch (e) {
        console.error(e);
      }
    }
  };

  // 修改群名
  if (
    room &&
    room?.payload?.topic == "群名" &&
    /^修改群名/.test(msg.text())
  ) {
    await room.topic(msg.text().split("修改群名")[1] as string);
  }

  // 自动回复
  if (msg.self()) {
    if (/^开启机器人$/.test(msg.text())) {
      bootOpen = true;
      msg.say("微信机器人已开启");
    } else if (/^关闭机器人$/.test(msg.text())) {
      bootOpen = false;
      msg.say("微信机器人已关闭");
    }
  }
  if (bootOpen && msg.text() != "" && !msg.self()) {
    let data = await robotSay(encodeURI(msg.text()));
    await msg.say(data as string);
  } else {
    return;
  }
}

// 加入群聊时触发
async function onRoomJoin(room: any, inviteeList: any, inviter: any) {
  const nameList = inviteeList.map((c: any) => c.name()).join(",");
  let topic = await room.topic();
  let myRoom = await bot.Room.find({
    topic
  });
  if (myRoom) {
    myRoom.say(`欢迎新朋友${nameList}加入${topic}群`);
  } else {
    console.log(1);
  }
}

// 添加好友触发
async function onFriendship(friendship: any) {
  console.log(friendship.hello());
  try {
    if (friendship.type() == 2) {
      if (friendship.hello() === "进前端群") {
        await friendship.accept();
      }
    } else if (friendship.type() == 1) {
      let contact = await bot.Contact.find({
        name: friendship.contact().name()
      }) || await bot.Contact.find({
        alias: friendship.contact().name()
      });
      if (contact) {
        await contact.say("你好呀");
      } else {
        console.log("没有此好友");
      }
    } else {
      console.log("添加失败");
    }
  } catch (e) {
    console.error(e);
  }
}

const bot = WechatyBuilder.build({
  name: "ding-dong-bot",
  puppet: "wechaty-puppet-wechat",
  puppetOptions: {
    uos: true
  }
});

bot.on("scan", onScan);
bot.on("login", onLogin);
bot.on("logout", onLogout);
bot.on("message", onMessage);
bot.on("room-join", onRoomJoin);
bot.on("friendship", onFriendship);

bot
  .start()
  .then(() => log.info("启动机器人", "启动成功"))
  .catch((e) => log.error("启动失败", e));
