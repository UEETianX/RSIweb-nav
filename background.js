// 设置默认分类数据
chrome.runtime.onInstalled.addListener(() => {
  const defaultCategories = {
    beginner: {
      name: "新手引导",
      expanded: false,
      links: [
        {name: "账号注册", url: "https://robertsspaceindustries.com/en/enlist?jumpto=https%3A%2F%2Frobertsspaceindustries.com%2Fen%2F", icon: "play-circle"},
        {name: "配置要求", url: "https://support.robertsspaceindustries.com/hc/en-us/articles/360042417374-Star-Citizen-Minimum-System-Requirements", icon: "book"},
        {name: "游戏资格", url: "https://robertsspaceindustries.com/en/store/pledge/browse/game-packages", icon: "ship"}
      ]
    },
    personal: {
      name: "个人资料",
      expanded: true,
      links: [
        {name: "我的库存", url: "https://robertsspaceindustries.com/account/pledges", icon: "warehouse"},
        {name: "我的账单", url: "https://robertsspaceindustries.com/account/billing", icon: "list-alt"},
        {name: "我的舰队", url: "https://robertsspaceindustries.com/account/organization", icon: "anchor"},
        {name: "我的邀请", url: "https://robertsspaceindustries.com/account/organization", icon: "share-alt"},
        {name: "PTU复制", url: "https://robertsspaceindustries.com/en/account/copy/ptu", icon: "cloud-download"},
        {name: "角色修复", url: "https://robertsspaceindustries.com/en/account/wrench", icon: "repeat"},
        {name: "客服工单", url: "https://support.robertsspaceindustries.com/hc/en-us/requests", icon: "edit"},
        {name: "账户设置", url: "https://robertsspaceindustries.com/account/settings", icon: "cogs"}
      ]
    },
    shop: {
      name: "官方商店",
      expanded: false,
      links: [
        {name: "单船页面", url: "https://robertsspaceindustries.com/en/store/pledge/browse/extras/standalone-ships", icon: "space-shuttle"},
        {name: "涂装页面", url: "https://robertsspaceindustries.com/en/store/pledge/browse/paints", icon: "paint-brush"},
        {name: "组合包页面", url: "https://robertsspaceindustries.com/en/store/pledge/browse/extras/packs", icon: "cube"},
        {name: "服装页面", url: "https://robertsspaceindustries.com/en/store/pledge/browse/extras/gear", icon: "street-view"},
        {name: "配件页面", url: "https://robertsspaceindustries.com/en/store/pledge/browse/extras/add-ons", icon: "briefcase"}
      ]
    },
    official: {
      name: "官方资讯",
      expanded: false,
      links: [
        {name: "开发路线", url: "https://robertsspaceindustries.com/roadmap/progress-tracker/deliverables", icon: "link"},
        {name: "借船一览", url: "https://support.robertsspaceindustries.com/hc/en-us/articles/360003093114-Loaner-Ship-Matrix", icon: "link"},
        {name: "光谱论坛", url: "https://robertsspaceindustries.com/spectrum/community/SC", icon: "link"},
        {name: "官方社区", url: "https://robertsspaceindustries.com/community-hub", icon: "link"},
        {name: "官方新闻", url: "https://robertsspaceindustries.com/en/comm-link", icon: "link"},
        {name: "配置分布", url: "https://robertsspaceindustries.com/en/telemetry", icon: "link"}
        
      ]
    },
    thrurl: {
      name: "第三方网站",
      expanded: false,
      links: [
        {name: "spv数据网", url: "https://www.spviewer.eu/", icon: "link"},
        {name: "erkul数据网", url: "https://robertsspaceindustries.com/en/store/pledge/browse/paints", icon: "link"},
        {name: "中文wiki", url: "https://42kit.citizenwiki.cn/", icon: "link"},
        {name: "飞船模型", url: "https://hangar.link/fleet/canvas", icon: "link"},
        {name: "星球时间", url: "https://dydrmr.github.io/VerseTime/", icon: "link"}
      ]
    },
    custom: {
      name: "自定义",
      expanded: true,
      links: []
    }
  };
  
  chrome.storage.local.set({ rsiCategories: defaultCategories });
  chrome.storage.local.set({ sidebarCollapsed: false });
});

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openPopup") {
    // 打开弹出页面
    console.log('收到打开弹出页面请求');
    chrome.action.openPopup();
  }
});
