import React, {
  useState, useEffect, useCallback,
} from 'react';
import { useHistory } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import {
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Divider,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';

import api from '@/services/api';
import useReport from '@/hooks/useReport';
import DemoDescription from '@/components/DemoDescription';
import snackbar from '@/services/SnackbarUtils';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import { ReportType, TemplateType } from '@/common';
import { queryKeys } from '@/queries/queryKeys';
import { useTemplatesAll } from '@/queries/get';

import ReportHistory from './components/ReportHistory';
import AssociationCard from './components/AssociationCard';
import AddUserCard from './components/AddUserCard';
import AddUserDialog from './components/AddUserDialog';
import DeleteReportDialog from './components/DeleteReportDialog';

import './index.scss';

type SettingsProps = WithLoadingInjectedProps;

const Settings = ({
  isLoading,
  setIsLoading,
}: SettingsProps): JSX.Element => {
  const { report, canEdit } = useReport();
  const queryClient = useQueryClient();

  const history = useHistory();

  const [selectedTemplate, setSelectedTemplate] = useState<string>(null);
  const [selectedState, setSelectedState] = useState('');
  const [reportVersion, setReportVersion] = useState('');
  const [kbVersion, setKbVersion] = useState('');
  const [matrixVersion, setMatrixVersion] = useState('');
  const [reportCreator, setReportCreator] = useState({
    ident: '',
    firstName: '',
    lastName: '',
    email: '',
  });
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showDeleteReportDialog, setShowDeleteReportDialog] = useState(false);

  const { data: templates, isSuccess: isTemplatesSuccess } = useTemplatesAll<TemplateType[]>({});

  useEffect(() => {
    if (isTemplatesSuccess) {
      setIsLoading(false);
    }
  }, [isTemplatesSuccess, setIsLoading]);

  const { mutate: deleteUser } = useMutation({
    mutationFn: (userIdent: string) => api.del(`/reports/${report.ident}/user/${userIdent}`, {}).request(),
    onMutate: () => { setIsLoading(true); },
    onSuccess: (_, userIdent) => {
      queryClient.setQueryData<ReportType>(
        queryKeys.reports.report(report.ident),
        (prev) => (prev
          ? {
            ...prev,
            users: prev.users.filter(
              (user) => user.ident !== userIdent,
            ),
          }
          : prev),
      );
      setIsLoading(false);
      snackbar.success('User removed');
    },
    onSettled: () => { setIsLoading(false); },
    onError: (err) => {
      snackbar.error(`Error removing user: ${err}`);
    },
  });

  const { mutate: updateReport } = useMutation(
    async (updateFields: {
      template?: string;
      state?: string;
      reportVersion?: string;
      kbVersion?: string;
      expression_matrix?: string;
    }) => {
      if (!report) throw new Error('Report not loaded');
      const updated = await api.put(`/reports/${report.ident}`, updateFields).request();
      return updated;
    },
    {
      onMutate: () => { setIsLoading(true); },
      onSuccess: () => {
        // Refetch all relevant report queries using Option 2 keys
        queryClient.refetchQueries({ queryKey: queryKeys.reports.report(report.ident) });
        setIsLoading(false);
        snackbar.success('Settings saved');
      },
      onSettled: () => { setIsLoading(false); },
      onError: (err: Error) => {
        snackbar.error(`Error saving settings: ${err?.message || err}`);
      },
    },
  );

  useEffect(() => {
    if (report) {
      setSelectedTemplate(report.template.ident);
      setSelectedState(report.state);
      setReportVersion(report.reportVersion);
      setKbVersion(report.kbVersion);
      setMatrixVersion(report.expression_matrix);
      setReportCreator(report.createdBy);
    }
  }, [report]);

  const handleTemplateChange = (event: SelectChangeEvent<string>) => {
    setSelectedTemplate(event.target.value);
  };

  const handleStateChange = (event: SelectChangeEvent<string>) => {
    setSelectedState(event.target.value);
  };

  const handleUserDelete = useCallback(async (ident: string) => {
    deleteUser(ident);
  }, [deleteUser]);

  const handleReportUpdate = useCallback(async () => {
    const updateFields: {
      template?: string;
      state?: string;
      reportVersion?: string;
      kbVersion?: string;
      expression_matrix?: string;
    } = {};

    if (report.template.ident !== selectedTemplate) {
      updateFields.template = templates?.find((t) => t.ident === selectedTemplate)?.name;
    }
    if (report.state !== selectedState) {
      updateFields.state = selectedState;
    }
    if (report.reportVersion !== reportVersion) {
      updateFields.reportVersion = reportVersion;
    }
    if (report.kbVersion !== kbVersion) {
      updateFields.kbVersion = kbVersion;
    }
    if (report.expression_matrix !== matrixVersion) {
      updateFields.expression_matrix = matrixVersion;
    }
    updateReport(updateFields);
  }, [
    report.template, report.state, report.reportVersion, report.kbVersion, report.expression_matrix,
    selectedTemplate, selectedState, reportVersion, kbVersion, matrixVersion, updateReport, templates,
  ]);

  const handleReportDelete = useCallback(async (isDeleted: boolean) => {
    if (!isDeleted) {
      setShowDeleteReportDialog(false);
      return;
    }
    try {
      await api.del(`/reports/${report.ident}`, {}).request();
      snackbar.info('Report deleted');
      history.push('/reports');
    } catch (err) {
      snackbar.error(`Error deleting report: ${err}`);
    }
  }, [report, history]);

  const usersSort = ({ role: roleA }, { role: roleB }) => {
    if (roleA > roleB) {
      return 1;
    }
    if (roleA < roleB) {
      return -1;
    }
    return 0;
  };

  return (
    <div className="settings">
      <Typography variant="h3">Settings</Typography>
      <DemoDescription>
        This section of the report is used for managing the report state, user assignments, and time tracking.
      </DemoDescription>
      {!isLoading && (
        <>
          <div className="settings__box">
            <div className="settings__inputs">
              <FormControl variant="outlined">
                <InputLabel id="settings-template">Report Template</InputLabel>
                <Select
                  disabled={!canEdit}
                  labelId="settings-template"
                  label="Report Template"
                  onChange={handleTemplateChange}
                  renderValue={(ident) => templates?.find((t) => t.ident === ident)?.name ?? ''}
                  value={selectedTemplate}
                  variant="outlined"
                >
                  {templates?.map((template) => (
                    <MenuItem key={template.ident} value={template.ident}>
                      {template.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl variant="outlined">
                <InputLabel id="settings-state">Report State</InputLabel>
                <Select
                  disabled={!canEdit}
                  labelId="settings-state"
                  label="Report State"
                  onChange={handleStateChange}
                  value={selectedState}
                  variant="outlined"
                >
                  <MenuItem value="ready">Ready for analysis</MenuItem>
                  <MenuItem value="active">Analysis underway</MenuItem>
                  <MenuItem value="reviewed">Reviewed</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="nonproduction">Non-Production</MenuItem>
                </Select>
              </FormControl>
              <TextField
                disabled={!canEdit}
                classes={{ root: 'settings__text-field' }}
                label="Report Version"
                onChange={(event) => setReportVersion(event.target.value)}
                value={reportVersion}
                variant="outlined"
              />
              <TextField
                disabled={!canEdit}
                classes={{ root: 'settings__text-field' }}
                label="Knowledgebase Version"
                onChange={(event) => setKbVersion(event.target.value)}
                value={kbVersion}
                variant="outlined"
              />
              <TextField
                classes={{ root: 'settings__text-field' }}
                disabled
                label="Expression Matrix Version"
                onChange={(event) => setMatrixVersion(event.target.value)}
                value={matrixVersion}
                variant="outlined"
              />
              <TextField
                classes={{ root: 'settings__text-field' }}
                disabled
                label="Report Creator"
                value={`${reportCreator.firstName} ${reportCreator.lastName} ${reportCreator.email ? `(${reportCreator.email})` : ''}`}
                variant="outlined"
              />
            </div>
            <div className="settings__actions">
              <Button
                classes={{ root: 'settings__actions--warn' }}
                disabled={!canEdit}
                onClick={() => setShowDeleteReportDialog(true)}
                variant="text"
              >
                Delete Report
              </Button>
              <Button
                disabled={!canEdit}
                color="secondary"
                onClick={handleReportUpdate}
                variant="outlined"
              >
                Update
              </Button>
              <DeleteReportDialog
                isOpen={showDeleteReportDialog}
                onClose={handleReportDelete}
              />
            </div>
          </div>
          <Divider />
          <ReportHistory />
          <>
            <Divider />
            <div className="settings__user-associations">
              <Typography variant="h3">Assigned Users</Typography>
              <div className="settings__user-association-cards">
                {report.users.length ? (
                  <>
                    {report.users.sort(usersSort).map((user) => (
                      <AssociationCard
                        key={user.ident}
                        user={user}
                        onDelete={handleUserDelete}
                      />
                    ))}
                  </>
                ) : (
                  <div className="settings__user-associations--none">
                    <Typography align="center">No users have been assigned</Typography>
                  </div>
                )}
              </div>
              <AddUserCard onAdd={() => setShowAddUserDialog(true)} />
              <AddUserDialog
                isOpen={showAddUserDialog}
                onAdd={() => setShowAddUserDialog(false)}
              />
            </div>
          </>
        </>
      )}
    </div>
  );
};

export default withLoading(Settings);
