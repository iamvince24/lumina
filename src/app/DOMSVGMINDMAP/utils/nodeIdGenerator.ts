export class NodeIdGenerator {
  private counter = 0;
  private prefix = 'node';

  generate(): string {
    this.counter++;
    return `${this.prefix}_${Date.now()}_${this.counter}`;
  }

  reset(): void {
    this.counter = 0;
  }
}

export const nodeIdGenerator = new NodeIdGenerator();
