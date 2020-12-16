import React, { useState, useEffect } from 'react';

import api from '../../../../services/api';
import DataTable from '../../../../components/DataTable';
import columnDefs from './columnDefs';

import './index.scss';

const Projects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const projectsResp = await api.get('/project', {}).request()

      setProjects(projectsResp);
    };

    getData();
  }, []);

  return (
    <div className="admin-table__container">
      {Boolean(projects.length) && (
        <DataTable
          rowData={projects}
          columnDefs={columnDefs}
          isPaginated
          isFullLength
        />
      )}
    </div>
  );
};

export default Projects;
