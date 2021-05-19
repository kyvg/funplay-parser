export interface ParsedItem {
  server: string;
  name: string;
  gold: number;
  itemName?: string;
  price: number;
  rec: number;
}

export const pageTypes = ['lots', 'chips'] as const;
export type PageType = typeof pageTypes[number];
export const chats: Set<number> = new Set();
export const last: ParsedItem[] = [];
