import React from 'react';

import './index.scss';

type ConfigTableProps = {
  config: string;
  isPrint: boolean;
};

const ConfigTable = ({ config, isPrint }: ConfigTableProps): JSX.Element => {
  if (!isPrint) {
    return (
      <div className="config">
        {config}
      </div>
    );
  }
  return (
    <table className="config__table">
      {config.split('\n').map((row) => (
        <tr key={row} className="config__row">
          <td>{row}</td>
        </tr>
      ))}
    </table>
  );
};

export default ConfigTable;
