import React, {
  useState, useEffect, useCallback, lazy,
} from 'react';
import { CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack';

import api from '@/services/api';
import DataTable from '@/components/DataTable';
import useResource from '@/hooks/useResource';
import useSecurity from '@/hooks/useSecurity';
import { adminColDefs, readOnlyColDefs } from './columnDefs';

import './index.scss';
import { ProjectType } from '../AdminView/types';

const AddEditProjectDialog = lazy(() => import('./components/AddEditProjectDialog'));

const Projects = (): JSX.Element => {
  const { userDetails } = useSecurity();
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [editableProjects, setEditableProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [editData, setEditData] = useState<ProjectType | null>();

  const { adminAccess, managerAccess } = useResource();

  const snackbar = useSnackbar();

  useEffect(() => {
    const getData = async () => {
      let projectsResp;
      if (adminAccess) {
        projectsResp = await api.get(`/project?admin=${adminAccess}`).request();
      } else {
        projectsResp = await api.get(`/project?admin=False`).request();
      }
      setProjects(projectsResp);
      setEditableProjects(userDetails.projects.map(elem => elem.ident));
      setLoading(false);
    };

    getData();
  }, [adminAccess, userDetails]);

  const handleEditStart = (rowData) => {
    setShowDialog(true);
    setEditData(rowData);
  };

  const handleDelete = useCallback(async ({ ident }) => {
    // eslint-disable-next-line no-restricted-globals, no-alert
    if (confirm('Are you sure you want to remove this project?')) {
      await api.del(`/project/${ident}`, {}).request();
      const newProjects = projects.filter((project) => project.ident !== ident);
      setProjects(newProjects);
      snackbar.enqueueSnackbar('Project deleted');
    } else {
      snackbar.enqueueSnackbar('Project not deleted');
    }
  }, [snackbar, projects]);

  const handleEditClose = useCallback((newData) => {
    setShowDialog(false);
    if (newData) {
      const projectIndex = projects.findIndex((project) => project.ident === newData.ident);
      if (projectIndex !== -1) {
        const newProjects = [...projects];
        newProjects[projectIndex] = newData;
        setProjects(newProjects);
        snackbar.enqueueSnackbar('Project edited');
      } else {
        setProjects((prevVal) => [...prevVal, newData]);
        snackbar.enqueueSnackbar('Project added');
      }
    }
    setEditData(null);
  }, [projects, snackbar]);

  return (
    <div className="admin-table__container">
      {!loading && (
        <>
          <DataTable
            rowData={projects.filter(elem => editableProjects.includes(elem.ident))}
            columnDefs={managerAccess ? adminColDefs : readOnlyColDefs}
            canViewDetails={false}
            isPaginated
            isFullLength
            canAdd={adminAccess}
            canEdit={managerAccess}
            canDelete={adminAccess}
            onEdit={handleEditStart}
            onAdd={() => setShowDialog(true)}
            addText="Add project"
            onDelete={handleDelete}
            titleText="Projects"
          />
          {showDialog && (
            <AddEditProjectDialog
              isOpen={showDialog}
              onClose={handleEditClose}
              editData={editData}
            />
          )}
        </>
      )}
      {loading && (
        <CircularProgress />
      )}
    </div>
  );
};

export default Projects;
