import React, { useCallback } from 'react';

import './index.scss';

type PrintTableProps = {
  data: Record<string, unknown>[];
  headers: string[];
  order?: string[];
};

const PrintTable = ({
  data,
  headers,
  order = [],
}: PrintTableProps): JSX.Element => {
  const sortFunc = useCallback(([keyA], [keyB]): number => {
    const indexA = order.findIndex((key) => key === keyA);
    const indexB = order.findIndex((key) => key === keyB);
    if (indexA < indexB) {
      return -1;
    }
    if (indexA > indexB) {
      return 1;
    }
    return 0;
  }, [order]);

  return (
    <div>
      {Boolean(data.length) && Boolean(headers.length) && (
        <table className="table">
          <thead className="table__header">
            <tr>
              {headers.map((val) => (
                <th key={val}>
                  {val}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((val, index) => (
              <tr key={index} className="table__row">
                {Object.entries(val).sort(sortFunc).map(([key, value]) => (
                  <td key={key}>
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PrintTable;
