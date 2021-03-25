import React from 'react';

import './index.scss';

type PrintTableProps = {
  data: Array<Record<string, unknown>>;
  headers: Array<string>;
};

const PrintTable = ({ data, headers }: PrintTableProps): JSX.Element => (
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
          {data.map((val) => (
            <tr key={val.Sample} className="table__row">
              <td>
                {val.Sample}
              </td>
              <td>
                {val['Sample Name']}
              </td>
              <td>
                {val['Collection Date']}
              </td>
              <td>
                {val['Primary Site']}
              </td>
              <td>
                {val['Biopsy Site']}
              </td>
              <td>
                {val['Patho TC']}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

export default PrintTable;
