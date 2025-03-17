import React, {
  useState, useCallback, lazy,
} from 'react';
import { CircularProgress } from '@mui/material';
import snackbar from '@/services/SnackbarUtils';
import { useQuery, useQueryClient, useMutation } from 'react-query';

import api from '@/services/api';
import DataTable from '@/components/DataTable';
import useResource from '@/hooks/useResource';
import useSecurity from '@/hooks/useSecurity';
import { adminColDefs, readOnlyColDefs } from './columnDefs';

import './index.scss';
import { ProjectType } from '../AdminView/types';

const AddEditProjectDialog = lazy(() => import('./components/AddEditProjectDialog'));

const fetchProjects = async (adminAccess: boolean): Promise<ProjectType[]> => {
      if (adminAccess) {
        return await api.get(`/project?admin=${adminAccess}`).request();
      } else {
        return await api.get('/project?admin=False').request();
      }
};

const deleteProject = async (ident: string) => {
  return await api.del(`/project/${ident}`, {}).request();
};

const Projects = (): JSX.Element => {
  const { userDetails } = useSecurity();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [editData, setEditData] = useState<ProjectType | null>();
  const { adminAccess, managerAccess } = useResource();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading, error } = useQuery<ProjectType[]>({
    queryKey: ['projects', adminAccess],
    queryFn: () => fetchProjects(adminAccess)
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      snackbar.success('Project deleted');
    },
    onError: (err) => {
      snackbar.error(`Failed to delete project ${err}`);
    }
  })

  const handleEditStart = (rowData) => {
    setShowDialog(true);
    setEditData(rowData);
  };

  const handleDelete = useCallback(async ({ ident }) => {
    // eslint-disable-next-line no-restricted-globals, no-alert
    if (confirm('Are you sure you want to remove this project?')) {
      deleteMutation.mutate(ident);
    }
  }, [deleteMutation]);

  const handleEditClose = useCallback((newData, isNew) => {
    setShowDialog(false);
    if (newData) {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      snackbar.success(isNew ? 'Project added' : 'Project edited');
    }
    setEditData(null);
  }, [queryClient]);

  const editableProjects = adminAccess
    ? projects.map((elem) => elem.ident)
    : userDetails.projects.map((elem) => elem.ident);

  return (
    <div className="admin-table__container">
      {!isLoading && (
        <>
          <DataTable
            rowData={projects.filter((elem) => editableProjects.includes(elem.ident))}
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
      {isLoading && (
        <CircularProgress />
      )}
    </div>
  );
};

export default Projects;
