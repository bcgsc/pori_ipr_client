import React, {
  useState, useEffect, useContext, useCallback,
} from 'react';
import { CircularProgress } from '@material-ui/core';
import { SnackbarContext } from '@bcgsc/react-snackbar-provider';

import api from '../../../../services/api';
import DataTable from '../../../../components/DataTable';
import columnDefs from './columnDefs';
import AddEditProjectDialog from './components/AddEditProjectDialog';

import './index.scss';
import { projectType } from '../../types';

const Projects = (): JSX.Element => {
  const [projects, setProjects] = useState<projectType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const snackbar = useContext(SnackbarContext);

  useEffect(() => {
    const getData = async () => {
      const projectsResp = await api.get('/project?admin=true', {}).request();

      setProjects(projectsResp);
      setLoading(false);
    };

    getData();
  }, []);

  const handleDelete = useCallback(async (ident) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Are you sure you want to remove this project?')) {
      await api.del(`/project/${ident}`, {}, {}).request();
      const newProjects = projects.filter(project => project.ident !== ident);
      setProjects(newProjects);
      snackbar.add('Project deleted');
    } else {
      snackbar.add('Project not deleted');
    }
  }, [snackbar, projects]);
  
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
          addText="Add project"
          canDelete
          onDelete={handleDelete}
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
