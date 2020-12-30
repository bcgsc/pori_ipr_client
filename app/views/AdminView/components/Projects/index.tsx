import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@material-ui/core';

import api from '../../../../services/api';
import DataTable from '../../../../components/DataTable';
import columnDefs from './columnDefs';
import AddEditProjectDialog from './components/AddEditProjectDialog';

import './index.scss';

const Projects = (): JSX.Element => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      const projectsResp = await api.get('/project?admin=true', {}).request();

      setProjects(projectsResp);
      setLoading(false);
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
      {loading && (
        <CircularProgress />
      )}
    </div>
  );
};

export default Projects;
