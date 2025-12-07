export class NodeIdGenerator {
  private counter = 0;
  private prefix = 'node';
  private lastTimestamp = 0;

  generate(): string {
    // 使用單調遞增的計數器確保唯一性
    this.counter++;

    // 組合多個元素確保唯一性：
    // 1. 時間戳（毫秒）
    // 2. 全局計數器（確保即使同一毫秒內也唯一）
    // 3. 隨機字串（額外保障，防止頁面重載後 counter 重置導致衝突）
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 8);

    // 確保時間戳單調遞增
    if (timestamp <= this.lastTimestamp) {
      this.lastTimestamp++;
    } else {
      this.lastTimestamp = timestamp;
    }

    return `${this.prefix}_${this.lastTimestamp}_${this.counter}_${randomPart}`;
  }

  reset(): void {
    this.counter = 0;
    this.lastTimestamp = 0;
  }
}

export const nodeIdGenerator = new NodeIdGenerator();
