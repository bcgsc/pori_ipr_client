import { Handler } from 'pagedjs';

class TableOverflowHandler extends Handler {
  // eslint-disable-next-line class-methods-use-this
  onOverflow(_overflow, rendered, _bounds) {
    const container: HTMLElement = rendered.closest('.pagedjs_page_content');
    if (container) {
      container.style.columnWidth = '';
    }
  }
}

export default TableOverflowHandler;
