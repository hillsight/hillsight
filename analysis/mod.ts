export interface Series<T> extends Iterable<T | undefined> {
  length: number;

  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(index: number): T | undefined;
}

export class Indicator<T> implements Series<T> {
  #cache: T[] = [];
  #function: (i: number) => T;

  length: number;
  constructor(fn: (i: number) => T, length: number) {
    this.length = length;
    this.#function = fn;
  }

  /**
   * Returns the item located at the specified index.
   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
   */
  at(index: number): T | undefined {
    if (index < 0)
      index += this.length;
    if (index >= this.length)
      return undefined;
    if (!this.#cache[index]) {
      this.#cache[index] = this.#function(index);
    }
    return this.#cache[index];
  }

  toString() {
    return this.constructor.name
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.length; i++) {
      yield this.at(i);
    }
  }
}