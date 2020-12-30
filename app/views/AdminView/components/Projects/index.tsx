import React, { useState, useEffect } from 'react';

import api from '../../../../services/api';
import DataTable from '../../../../components/DataTable';
import columnDefs from './columnDefs';
import AddEditProjectDialog from './components/AddEditProjectDialog';

import './index.scss';

const Projects = (): JSX.Element => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const projectsResp = await api.get('/project?admin=true', {}).request();

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
          canViewDetails={false}
          isPaginated
          isFullLength
          EditDialog={AddEditProjectDialog}
          canEdit
          canAdd
          titleText="Projects"
        />
      )}
    </div>
  );
};

export default Projects;
