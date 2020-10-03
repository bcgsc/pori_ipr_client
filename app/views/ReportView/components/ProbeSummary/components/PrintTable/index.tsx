import React from 'react';

import './index.scss';

type Props = {
  data: Array<object>,
  headers: Array<string>,
};

const PrintTable: React.FC<Props> = ({ data, headers }) => {
  return (
    <div>
      {Boolean(data.length) && Boolean(headers.length) && (
        <table className="table">
          <thead className="table__header">
            <tr>
              {headers.map(val => (
                <th>
                  {val}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(val => (
              <tr className="table__row">
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
};

export default PrintTable;
