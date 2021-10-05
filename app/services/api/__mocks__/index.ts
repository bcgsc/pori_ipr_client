export default {
  get: jest.fn(() => ({ request: jest.fn() })),
  post: jest.fn(() => ({ request: jest.fn() })),
  put: jest.fn(() => ({ request: jest.fn() })),
  del: jest.fn(() => ({ request: jest.fn() })),
};
