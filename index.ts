import { config } from 'dotenv';
config();

import { parse } from 'node-html-parser';
import fetch from 'node-fetch';
import { sendToAll } from './bot';
import { last, ParsedItem } from './params';


const url = process.env.WEB_PAGE;

if (!url) {
  throw new TypeError('process.env.WEB_PAGE is undefined')
}

const retryTime = 21230 // дефолтный таймаут между вызовом страницы страниц

const delay = async (ms: number) => await new Promise(resolve => setTimeout(resolve, ms));

const parseNumber = (content: string) => {
  const number = parseFloat(content.trim());
  if (Number.isNaN(number)) {
    return 0;
  }
  return number;
}

async function parsePage() {
  try {
    const page = await fetch(url ?? '')
      .then((resp) => resp.text())
      .catch((e) => { console.log(e) });

    if (!page) {
      return;
    }

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
    last.splice(0, last.length, ...parsedItems)
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

main();

function compare(a: number, b: number) {
  if (a > b) return `⬇ ${a - b}`
}

function diff(seller: ParsedItem) {
  let s = last.find((item) => {
    return item.name === seller.name
      && item.server === seller.server
      && item.itemName === seller.itemName;
  });
  // продовец найден в старой выгрузке
  if (s) {
    // смотрим менялась ли цена или бьем продажи
    if (s.gold !== seller.gold) {
      sendToAll(`*${seller.name}*: 💰${s.gold} -> ${seller.gold} \\[ ${compare(s.gold,seller.gold)}/${seller.server}\]\(${seller.rec}\)`);
    }
    if (s.price !== seller.price) {
      sendToAll(`*${seller.name}*: '📈'${s.price} -> ${seller.price}`)
    }
  }
}
