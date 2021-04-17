require('dotenv').config();
const { parse } = require('node-html-parser');
const fetch = require('node-fetch');
const Tgbot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const bot = new Tgbot(token, { polling: true });

let chats = [];
let last = [];

bot.onText(/\/start/, (msg) => {
  chats.push(msg.chat.id)
  bot.sendMessage(msg.chat.id, 'chat id saved')
});

bot.onText(/\/stop/, (msg) => {
  chats = chats.filter((chat) => chat !== msg.chat.id);
  bot.sendMessage(msg.chat.id, 'chat id deleted')
});

bot.onText(/\/list/, (msg) => {
  try {
  let chatId = msg.chat.id;

  const resp = last.map((v) => {
    return `\`*Name*: ${v.name} Item: ${v.itemName} Gold: ${v.gold} Price: ${v.price} Server: ${v.server}\``;
  });
  console.log(resp);
  bot.sendMessage(chatId, resp.join('\n\n'), { 'parse_mode': 'MarkdownV2' });
} catch (e) {
  console.log(e);
}
});

const page = process.env.WEB_PAGE;
const retryTime = 21230 // дефолтный таймаут между вызовом страницы страниц


const delay = async (ms) => await new Promise(resolve => setTimeout(resolve, ms));

/** @param {string} content */
const parseNumber = (content) => {
  const number = parseFloat(content.trim());
  if (Number.isNaN(number)) {
    return 0;
  }
  return number;
}

/**
 * @param {String} id идентификатор типа
 * @desc парсер страницы
 */
async function parsePage() {
  try {
    const page = await fetch(page)
      .then((resp) => resp.text())
      .catch((e) => { console.log(e) });
    const html = parse(page);
    const items = html.querySelectorAll('a.tc-item');
    const parsedItems = items.map((item) => {
      const server = item.querySelector('div.tc-server').textContent;
      const name = item.querySelector('div.media-user-name').textContent;
      const gold = item.querySelector('div.tc-amount').textContent;
      const price = item.querySelector('div.tc-price').textContent;
      const rec = item.querySelector('div.media-user-reviews').textContent;
      const itemName = item.querySelector('div.tc-desc-text').textContent;
      const parsedItem = {
        server,
        name,
        itemName,
        gold: parseNumber(gold),
        price: parseNumber(price),
        rec: parseNumber(rec),
      };
      diff(parsedItem);
      return parsedItem;
    });
    // console.log(parsedItems);
    last = parsedItems;
  } catch(e) {
    console.log(e);
  }
}

/**
 * Основной модуль
 * @desс Main Основной модуль
 */
 async function main () {
  while (true) {
    try {
      await parsePage()
      await delay(retryTime)
    } catch (e) {
      console.error(e)
    }
  }
}

main()

function sendAll(msg) {
  if (msg) {
    chats.forEach((id) => {
      bot.sendMessage(id, msg, { 'parse_mode': 'Markdown' });
    });
  }
}

function compare(a, b) {
  if ((a - b) > 0) return `⬇ ${was - now}`
}

function diff(seller) {
  let s = last.find((item) => {
    return item.name === seller.name
      && item.server === seller.server
      && item.itemName === seller.itemName;
  });
  // продовец найден в старой выгрузке
  if (s) {
    // смотрим менялась ли цена или бьем продажи
    const message = `*${seller.name}*: 💰${s.gold} -> ${seller.gold} \\[ ${compare(s.gold,seller.gold)}/${seller.server}\]\(${seller.rec}\)`;
    if (s.gold !== seller.gold) sendAll(message);
    if (s.price !== seller.price) sendAll(
      '*' + seller.name + '*: ' + '📈' + s.price + ' -> ' + seller.price)
  }
}
