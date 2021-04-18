import { Telegraf } from 'telegraf';
import { chats, last } from './params';

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new TypeError('process.env.BOT_TOKEN is undefined')
}

export const bot = new Telegraf(token ?? '');

bot.command('start', (ctx) => {
  chats.push(ctx.chat.id);
  ctx.reply('chat id saved');
});

bot.command('stop', (ctx) => {
  const index = chats.indexOf(ctx.chat.id);
  if (index !== -1) {
    chats.splice(index, 1);
    ctx.reply('chat id deleted');
  } else {
    ctx.reply('chan not found');
  }
});

bot.command('list', (ctx) => {
  try {
    const resp = last.map((i) => {
      return `\`*Name*: ${i.name} Item: ${i.itemName} Gold: ${i.gold} Price: ${i.price} Server: ${i.server}\``;
    });
    if (resp.length) {
      ctx.reply(resp.join('\n\n'), { 'parse_mode': 'MarkdownV2' });
    } else {
      ctx.reply('list is empty')
    }
  } catch (e) {
    console.log(e);
  }
});

bot.launch();

export const sendToAll = (msg: string): void => {
  chats.forEach((id) => {
    bot.telegram.sendMessage(id, msg, { 'parse_mode': 'MarkdownV2' });
  });
}