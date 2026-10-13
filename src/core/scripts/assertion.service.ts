import type { IAssertionChain } from './interfaces';

class AssertionChain implements IAssertionChain {
  private readonly isNegated: boolean;
  private readonly customMessage?: string;

  constructor(
    private readonly actual: unknown,
    isNegated = false,
    customMessage?: string,
  ) {
    this.isNegated = isNegated;
    this.customMessage = customMessage;
  }

  public get to(): IAssertionChain {
    return this;
  }

  public get be(): IAssertionChain {
    return this;
  }

  public get have(): IAssertionChain {
    return this;
  }

  public get not(): IAssertionChain {
    return new AssertionChain(this.actual, !this.isNegated, this.customMessage);
  }

  public get ok(): IAssertionChain {
    const passed = Boolean(this.actual);
    this.assert(passed, 'Expected value to be truthy');
    return this;
  }

  public get true(): IAssertionChain {
    const passed = this.actual === true;
    this.assert(passed, 'Expected value to be true');
    return this;
  }

  public get false(): IAssertionChain {
    const passed = this.actual === false;
    this.assert(passed, 'Expected value to be false');
    return this;
  }

  public get null(): IAssertionChain {
    const passed = this.actual === null;
    this.assert(passed, 'Expected value to be null');
    return this;
  }

  public get undefined(): IAssertionChain {
    const passed = this.actual === undefined;
    this.assert(passed, 'Expected value to be undefined');
    return this;
  }

  public get empty(): IAssertionChain {
    let isEmpty = false;
    if (this.actual === null || this.actual === undefined) {
      isEmpty = true;
    } else if (typeof this.actual === 'string' || Array.isArray(this.actual)) {
      isEmpty = this.actual.length === 0;
    } else if (typeof this.actual === 'object') {
      isEmpty = Object.keys(this.actual).length === 0;
    }
    this.assert(isEmpty, 'Expected value to be empty');
    return this;
  }

  public equal(expected: unknown): IAssertionChain {
    return this.eql(expected);
  }

  public eql(expected: unknown): IAssertionChain {
    const passed = JSON.stringify(this.actual) === JSON.stringify(expected);
    this.assert(
      passed,
      `Expected ${JSON.stringify(this.actual)} to equal ${JSON.stringify(expected)}`,
    );
    return this;
  }

  public a(expectedType: string): IAssertionChain {
    return this.validateType(expectedType);
  }

  public an(expectedType: string): IAssertionChain {
    return this.validateType(expectedType);
  }

  public property(name: string, value?: unknown): IAssertionChain {
    const isObject = typeof this.actual === 'object' && this.actual !== null;
    if (!isObject) {
      this.assert(false, 'Expected target to be an object to check property');
      return this;
    }
    const record = this.actual as Record<string, unknown>;
    const hasProp = Object.prototype.hasOwnProperty.call(record, name);
    if (value !== undefined) {
      const matchValue = JSON.stringify(record[name]) === JSON.stringify(value);
      this.assert(
        hasProp && matchValue,
        `Expected property "${name}" with value ${JSON.stringify(value)}`,
      );
      return this;
    }
    this.assert(hasProp, `Expected object to have property "${name}"`);
    return this;
  }

  public lengthOf(expectedLength: number): IAssertionChain {
    const target = this.actual as { length?: number } | null | undefined;
    const len = target !== null && target !== undefined ? target.length : undefined;
    const passed = len === expectedLength;
    this.assert(
      passed,
      `Expected length to be ${String(expectedLength)}, but got ${String(len)}`,
    );
    return this;
  }

  public include(expectedItem: unknown): IAssertionChain {
    let passed = false;
    if (typeof this.actual === 'string' && typeof expectedItem === 'string') {
      passed = this.actual.includes(expectedItem);
    } else if (Array.isArray(this.actual)) {
      passed = this.actual.some(
        (item) => JSON.stringify(item) === JSON.stringify(expectedItem),
      );
    }
    this.assert(
      passed,
      `Expected ${JSON.stringify(this.actual)} to include ${JSON.stringify(expectedItem)}`,
    );
    return this;
  }

  public greaterThan(expected: number): IAssertionChain {
    const passed = typeof this.actual === 'number' && this.actual > expected;
    this.assert(
      passed,
      `Expected ${String(this.actual)} to be greater than ${String(expected)}`,
    );
    return this;
  }

  public lessThan(expected: number): IAssertionChain {
    const passed = typeof this.actual === 'number' && this.actual < expected;
    this.assert(
      passed,
      `Expected ${String(this.actual)} to be less than ${String(expected)}`,
    );
    return this;
  }

  public atLeast(expected: number): IAssertionChain {
    const passed = typeof this.actual === 'number' && this.actual >= expected;
    this.assert(
      passed,
      `Expected ${String(this.actual)} to be at least ${String(expected)}`,
    );
    return this;
  }

  public atMost(expected: number): IAssertionChain {
    const passed = typeof this.actual === 'number' && this.actual <= expected;
    this.assert(
      passed,
      `Expected ${String(this.actual)} to be at most ${String(expected)}`,
    );
    return this;
  }

  public within(min: number, max: number): IAssertionChain {
    const passed =
      typeof this.actual === 'number' &&
      this.actual >= min &&
      this.actual <= max;
    this.assert(
      passed,
      `Expected ${String(this.actual)} to be within ${String(min)} and ${String(max)}`,
    );
    return this;
  }

  private validateType(expectedType: string): IAssertionChain {
    const lowerType = expectedType.toLowerCase();
    let actualType: string = typeof this.actual;
    if (Array.isArray(this.actual)) {
      actualType = 'array';
    } else if (this.actual === null) {
      actualType = 'null';
    }
    const passed = actualType === lowerType;
    this.assert(passed, `Expected ${actualType} to be ${lowerType}`);
    return this;
  }

  private assert(condition: boolean, message: string): void {
    const finalCondition = this.isNegated ? !condition : condition;
    if (!finalCondition) {
      const prefix = this.isNegated ? 'Not: ' : '';
      const customPrefix =
        typeof this.customMessage === 'string' && this.customMessage.length > 0
          ? `${this.customMessage}: `
          : '';
      throw new Error(`${customPrefix}${prefix}${message}`);
    }
  }
}

export { AssertionChain };
