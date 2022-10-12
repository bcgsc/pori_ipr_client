import { ApiCall } from './ApiCall';
import { RequestReturnType } from './types';

/**
 * Set of Api calls to be co-requested and co-aborted
 */
class ApiCallSet {
  calls: ApiCall[];

  constructor(calls = []) {
    this.calls = calls;
  }

  push(call: ApiCall): void {
    this.calls.push(call);
  }

  abort(): void {
    this.calls.forEach((controller) => controller.abort());
  }

  async request(): Promise<RequestReturnType[] | void> {
    return Promise.all(this.calls.map((call) => call.request()));
  }
}

export default ApiCallSet;
