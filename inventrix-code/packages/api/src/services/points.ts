export const EARN_AMOUNT = 10;
export const EARN_WINDOW_MS = 10_000;
export const EARN_MAX_PER_WINDOW = 3;

/** 商品點數價格：max(1, ceil(price)) */
export const toPointPrice = (price: number): number => Math.max(1, Math.ceil(price));

export const withPointPrice = <T extends { price: number }>(product: T) => ({
  ...product,
  point_price: toPointPrice(product.price)
});

// 每個帳號最近成功入帳的時間戳（滑動視窗）。僅存於單一程序記憶體。
const earnHistory = new Map<number, number[]>();

/**
 * 嘗試入帳：同一帳號任何 EARN_WINDOW_MS 內最多成功 EARN_MAX_PER_WINDOW 次。
 * 回傳 true 表示允許（並已記錄），false 表示超過上限（不記錄）。
 */
export const tryRegisterEarn = (userId: number, now: number = Date.now()): boolean => {
  const recent = (earnHistory.get(userId) ?? []).filter(t => now - t < EARN_WINDOW_MS);
  if (recent.length >= EARN_MAX_PER_WINDOW) {
    earnHistory.set(userId, recent);
    return false;
  }
  recent.push(now);
  earnHistory.set(userId, recent);
  return true;
};

/** 入帳失敗（例如 DB 寫入失敗）時撤銷剛記錄的那一次。 */
export const revertEarn = (userId: number, timestamp: number): void => {
  const list = earnHistory.get(userId);
  if (!list) return;
  const idx = list.lastIndexOf(timestamp);
  if (idx >= 0) list.splice(idx, 1);
};

export const resetEarnHistory = (): void => earnHistory.clear();
