import React, { useContext } from 'react';

import ReportContext from '../../../../../../components/ReportContext';

import './index.scss';

type ConfigTableProps = {
  config: string;
  isPrint: boolean;
};

const ConfigTable = ({ config, isPrint }: ConfigTableProps): JSX.Element => {
  const { report } = useContext(ReportContext);

  if (!isPrint) {
    return (
      <div className="config">
        {config}
      </div>
    );
  }
  return (
    <table className="config__table">
      {config.split('\n').map(row => (
        <tr key={row}>
          <td>{row}</td>
        </tr>
      ))}
    </table>
  );
};

export default ConfigTable;
