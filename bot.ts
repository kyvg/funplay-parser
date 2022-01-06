import { Telegraf } from 'telegraf';
import { chats, last } from './params';

const ROWS_PER_MESSAGE = 50;

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new TypeError('process.env.BOT_TOKEN is undefined')
}

export const bot = new Telegraf(token ?? '');

bot.command('start', (ctx) => {
  chats.add(ctx.chat.id);
  ctx.reply('chat id saved');
});

bot.command('stop', (ctx) => {
  const deleted = chats.delete(ctx.chat.id);
  if (deleted) {
    ctx.reply('chat id deleted');
  } else {
    ctx.reply('chat not found');
  }
});

bot.command('list', async (ctx) => {
  try {
    const messages = last.map((i) => {
      const item = i.itemName ? ` Item: ${i.itemName}` : '';
      return `\`*Name*: ${i.name}${item} Gold: ${i.gold} Price: ${i.price} Server: ${i.server}\``;
    });
    if (!messages.length) {
      await ctx.reply('list is empty');
    }
    while (messages.length) {
      await ctx.reply(messages.splice(0, ROWS_PER_MESSAGE).join('\n\n'), { parse_mode: 'Markdown' });
    }
  } catch (e) {
    console.log(e);
  }
});

bot.launch();

export const sendToAll = (msg: string): void => {
  chats.forEach((id) => {
    bot.telegram.sendMessage(id, msg, { parse_mode: 'Markdown' });
  });
}
