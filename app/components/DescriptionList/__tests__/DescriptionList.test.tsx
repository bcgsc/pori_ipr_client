import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import DescriptionList from '..';

describe('DescriptionList', () => {
  test('renders each term and value', () => {
    render(<DescriptionList entries={[{ term: 'Name', value: 'Alice' }]} />);

    expect(screen.getByText('Name:')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  test('omits entries with null or empty values', () => {
    render(
      <DescriptionList
        entries={[
          { term: 'Kept', value: 'shown' },
          { term: 'NullVal', value: null },
          { term: 'EmptyVal', value: '' },
        ]}
      />,
    );

    expect(screen.getByText('Kept:')).toBeInTheDocument();
    expect(screen.queryByText('NullVal:')).toBeNull();
    expect(screen.queryByText('EmptyVal:')).toBeNull();
  });

  test('renders nothing when there are no visible entries', () => {
    const { container } = render(<DescriptionList entries={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  test('invokes the entry action when its button is clicked', () => {
    const action = jest.fn();
    render(<DescriptionList entries={[{ term: 'Link', value: 'go', action }]} />);

    fireEvent.click(screen.getByRole('button'));

    expect(action).toHaveBeenCalledTimes(1);
  });
});
