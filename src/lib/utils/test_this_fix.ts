import { throttle } from './performance';

class TestClass {
  value = 'test';
  throttledLog = throttle(this.log, 100);

  log() {
    console.log(this.value);
  }
}

const t = new TestClass();
t.throttledLog();
