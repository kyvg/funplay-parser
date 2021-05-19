export interface ParsedItem {
  server: string;
  name: string;
  gold: number;
  price: number;
  rec: number;
}

export const chats: Set<number> = new Set();
export const last: ParsedItem[] = [];
