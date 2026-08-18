export default {
  get: jest.fn(() => ({ request: jest.fn() })),
  post: jest.fn(() => ({ request: jest.fn() })),
  put: jest.fn(() => ({ request: jest.fn() })),
  del: jest.fn(() => ({ request: jest.fn() })),
};

export const ApiCallSet = jest.fn().mockImplementation(() => ({
  request: jest.fn().mockResolvedValue([]),
  abort: jest.fn(),
}));
