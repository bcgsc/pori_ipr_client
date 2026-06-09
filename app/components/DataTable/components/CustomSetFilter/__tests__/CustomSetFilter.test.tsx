import React, { act } from 'react';
import {
  render, screen, fireEvent, within,
} from '@testing-library/react';
import type { IFilterParams, IDoesFilterPassParams } from '@ag-grid-community/core';

import CustomSetFilter from '..';

type FilterHandle = {
  doesFilterPass: (params: IDoesFilterPassParams) => boolean;
  isFilterActive: () => boolean;
  getModel: () => { values: string[]; text: string } | null;
  setModel: (model: { values?: string[]; text?: string } | null) => void;
};

const ROW_VALUES = ['banana', 'apple', 'cherry'];

// Builds IFilterParams backed by a simple in-memory node list keyed on a `v` field
const buildParams = (values: string[] = ROW_VALUES) => {
  const nodes = values.map((v) => ({ data: { v } }));
  const filterChangedCallback = jest.fn();
  const params = {
    column: {},
    filterChangedCallback,
    api: {
      forEachNode: (cb: (node: { data: { v: string } }) => void) => nodes.forEach(cb),
      getValue: (_col: unknown, node: { data: { v: string } }) => node.data.v,
    },
  } as unknown as IFilterParams;
  return { params, filterChangedCallback };
};

const nodeFor = (v: string) => ({ data: { v } }) as IDoesFilterPassParams['node'];

const renderFilter = (values?: string[]) => {
  const { params, filterChangedCallback } = buildParams(values);
  const ref = React.createRef<FilterHandle>();
  render(<CustomSetFilter ref={ref as React.Ref<unknown>} {...params} />);
  return { ref, filterChangedCallback };
};

describe('CustomSetFilter', () => {
  test('It renders a sorted checkbox for each unique value plus a select-all', () => {
    renderFilter();

    expect(screen.getByText('(Select All)')).toBeInTheDocument();
    const checkboxes = screen.getAllByRole('checkbox');
    // select-all + one per unique value
    expect(checkboxes).toHaveLength(ROW_VALUES.length + 1);
    const labels = checkboxes
      .slice(1) // skip "(Select All)"
      .map((cb) => cb.getAttribute('value'));

    expect(labels).toEqual(['apple', 'banana', 'cherry']);
  });

  test('It is inactive with an empty model until a value is selected', () => {
    const { ref } = renderFilter();

    expect(ref.current?.isFilterActive()).toBe(false);
    expect(ref.current?.getModel()).toBeNull();

    fireEvent.click(screen.getByLabelText('apple'));

    expect(ref.current?.isFilterActive()).toBe(true);
    expect(ref.current?.getModel()).toEqual({ values: ['apple'], text: '' });
  });

  test('It notifies ag-grid when a selection changes', () => {
    const { filterChangedCallback } = renderFilter();

    // not called on initial render
    expect(filterChangedCallback).not.toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText('cherry'));

    expect(filterChangedCallback).toHaveBeenCalled();
  });

  test('Select All selects every value, and unchecking it clears them', () => {
    const { ref } = renderFilter();

    fireEvent.click(screen.getByLabelText(/select all/i));
    expect(ref.current?.getModel()).toEqual({
      values: ['apple', 'banana', 'cherry'],
      text: '',
    });

    fireEvent.click(screen.getByLabelText(/select all/i));
    expect(ref.current?.getModel()).toBeNull();
  });

  test('doesFilterPass matches on the text filter', () => {
    const { ref } = renderFilter();

    fireEvent.change(screen.getByPlaceholderText('Search text...'), {
      target: { value: 'app' },
    });

    expect(ref.current?.doesFilterPass({ node: nodeFor('apple') } as IDoesFilterPassParams)).toBe(true);
    expect(ref.current?.doesFilterPass({ node: nodeFor('banana') } as IDoesFilterPassParams)).toBe(false);
  });

  test('doesFilterPass matches on selected checkbox values', () => {
    const { ref } = renderFilter();

    fireEvent.click(screen.getByLabelText('banana'));

    expect(ref.current?.doesFilterPass({ node: nodeFor('banana') } as IDoesFilterPassParams)).toBe(true);
    expect(ref.current?.doesFilterPass({ node: nodeFor('apple') } as IDoesFilterPassParams)).toBe(false);
  });

  test('setModel applies external state and getModel reflects it', () => {
    const { ref } = renderFilter();

    act(() => {
      ref.current?.setModel({ values: ['apple', 'cherry'], text: 'ch' });
    });

    expect(ref.current?.getModel()).toEqual({ values: ['apple', 'cherry'], text: 'ch' });
    expect((screen.getByLabelText('apple') as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText('banana') as HTMLInputElement).checked).toBe(false);

    act(() => {
      ref.current?.setModel(null);
    });

    expect(ref.current?.getModel()).toBeNull();
  });

  test('setModel does not trigger the filterChanged callback', () => {
    const { ref, filterChangedCallback } = renderFilter();

    act(() => {
      ref.current?.setModel({ values: ['apple'], text: '' });
    });

    expect(filterChangedCallback).not.toHaveBeenCalled();
  });

  test('Checking then unchecking a value removes it from the model', () => {
    const { ref } = renderFilter();
    const container = screen.getByText('(Select All)').closest('.matches-filter') as HTMLElement;

    const apple = within(container).getByLabelText('apple');
    fireEvent.click(apple);
    expect(ref.current?.getModel()).toEqual({ values: ['apple'], text: '' });

    fireEvent.click(apple);
    expect(ref.current?.getModel()).toBeNull();
  });
});
