import React, {
  useState, useEffect, useContext, useCallback,
} from 'react';
import {
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Divider,
  FormControl,
  InputLabel,
  LinearProgress,
} from '@material-ui/core';

import api from '@/services/api';
import ReportContext from '@/components/ReportContext';
import EditContext from '@/components/EditContext';
import { UserType } from '@/common';
import snackbar from '@/services/SnackbarUtils';
import Analysis from './components/Analysis';
import AssociationCard from './components/AssociationCard';

import './index.scss';
import AddUserCard from './components/AddUserCard';
import AddUserDialog from './components/AddUserDialog';

type SettingsProps = {
  isProbe?: boolean;
};

const Settings = ({
  isProbe = false,
}: SettingsProps): JSX.Element => {
  const { report, setReport } = useContext(ReportContext);
  const { canEdit } = useContext(EditContext);

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState({ name: '', ident: '' });
  const [selectedState, setSelectedState] = useState('');
  const [reportVersion, setReportVersion] = useState('');
  const [kbVersion, setKbVersion] = useState('');
  const [matrixVersion, setMatrixVersion] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        const templateResp = await api.get('/templates', {}).request();
        setTemplates(templateResp);
        setIsLoading(false);
      };
      getData();
    }
  }, [report]);

  useEffect(() => {
    if (report) {
      setSelectedTemplate(report.template);
      setSelectedState(report.state);
      setReportVersion(report.reportVersion);
      setKbVersion(report.kbVersion);
      setMatrixVersion(report.expression_matrix);
    }
  }, [report]);

  const handleTemplateChange = (
    event: React.ChangeEvent<{ value: { name: string, ident: string } }>,
  ) => {
    setSelectedTemplate(event.target.value);
  };

  const handleStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(event.target.value);
  };

  const handleUserDelete = useCallback(async (user: UserType, role: string) => {
    try {
      const newReport = await api.del(
        `/reports/${report.ident}/user`,
        { user: user.ident, role },
        {},
      ).request();
      setReport(newReport);
      snackbar.success('User removed');
    } catch (err) {
      snackbar.error(`Error removing user: ${err}`);
    }
  }, [report, setReport]);

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
      {!isLoading && (
        <>
          <div className="settings__box">
            <div className="settings__inputs">
              <FormControl variant="outlined">
                <InputLabel id="settings-template">Report Template</InputLabel>
                <Select
                  labelId="settings-template"
                  label="Report Template"
                  onChange={handleTemplateChange}
                  renderValue={(value) => value.name}
                  value={selectedTemplate}
                  variant="outlined"
                >
                  {templates.map((template) => (
                    <MenuItem key={template.ident} value={template}>
                      {template.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl variant="outlined">
                <InputLabel id="settings-state">Report State</InputLabel>
                <Select
                  labelId="settings-state"
                  label="Report State"
                  onChange={handleStateChange}
                  value={selectedState}
                  variant="outlined"
                >
                  <MenuItem value="ready">Ready for analysis</MenuItem>
                  <MenuItem value="active">Analysis underway</MenuItem>
                  <MenuItem value="reviewed">Reviewed</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                  <MenuItem value="nonproduction">Non-Production</MenuItem>
                </Select>
              </FormControl>
              <TextField
                classes={{ root: 'settings__text-field' }}
                label="Report Version"
                value={reportVersion}
                variant="outlined"
              />
              <TextField
                classes={{ root: 'settings__text-field' }}
                label="Knowledgebase Version"
                value={kbVersion}
                variant="outlined"
              />
              <TextField
                classes={{ root: 'settings__text-field' }}
                disabled
                label="Expression Matrix Version"
                value={matrixVersion}
                variant="outlined"
              />
            </div>
            <div className="settings__actions">
              <Button
                classes={{ root: 'settings__actions--warn' }}
                variant="text"
              >
                Delete Report
              </Button>
              <Button variant="outlined" color="secondary">Update</Button>
            </div>
          </div>
          <Divider />
          <Analysis />
          {!isProbe && (
            <>
              <Divider />
              <div>
                <Typography variant="h3">User Associations</Typography>
                <div>
                  {report.users.sort(usersSort).map((user) => (
                    <AssociationCard
                      key={user.ident}
                      user={user.user}
                      role={user.role}
                      onDelete={handleUserDelete}
                    />
                  ))}
                </div>
                <AddUserCard onAdd={() => setShowAddUserDialog(true)} />
                <AddUserDialog
                  isOpen={showAddUserDialog}
                  onAdd={() => setShowAddUserDialog(false)}
                />
              </div>
            </>
          )}
        </>
      )}
      {isLoading && (
        <LinearProgress color="secondary" />
      )}
    </div>
  );
};

export default Settings;
