/* eslint-disable import/no-extraneous-dependencies */
import '@testing-library/jest-dom/extend-expect';
// https://github.com/ueberdosis/tiptap/issues/4455 -- seems like jest needs mocking these classes
// Due to https://github.com/jsdom/jsdom/issues/1568#issuecomment-486134384
class ClipboardEventMock extends Event {
  constructor(type, eventInitDict) {
    super(type, eventInitDict);
    this.clipboardData = {
      getData: jest.fn(),
      setData: jest.fn(),
    };
  }
}
global.ClipboardEvent = ClipboardEventMock;
class DragEventMock extends Event {
  constructor(type, eventInitDict) {
    super(type, eventInitDict);
    this.dataTransfer = {
      getData: jest.fn(),
      setData: jest.fn(),
    };
  }
}
global.DragEvent = DragEventMock;