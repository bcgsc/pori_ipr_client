import React, {
  useState, useCallback, useContext, useEffect,
} from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@material-ui/core';

import api from '@/services/api';
import UserAutocomplete from '@/components/UserAutocomplete';
import ReportContext from '@/components/ReportContext';
import snackbar from '@/services/SnackbarUtils';
import { UserType } from '@/common';

import './index.scss';

type AddUserDialogProps = {
  isOpen: boolean;
  onAdd: (user?: UserType) => void;
};

const AddUserDialog = ({
  isOpen = false,
  onAdd,
}: AddUserDialogProps): JSX.Element => {
  const { report, setReport } = useContext(ReportContext);

  const [user, setUser] = useState<UserType>();
  const [role, setRole] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setUser(null);
      setRole('');
    }
  }, [isOpen]);

  const handleAddUser = useCallback(async () => {
    try {
      const newReport = await api.post(
        `/reports/${report.ident}/user`,
        { user: user.ident, role },
        {},
      ).request();
      setReport(newReport);
      snackbar.success('User added!');
      onAdd();
    } catch (err) {
      snackbar.error(`Error adding user: ${err}`);
    }
  }, [report, onAdd, user, role, setReport]);
  
  const handleUserChange = (newUser) => {
    setUser(newUser);
  };

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(event.target.value);
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={isOpen} onClose={() => onAdd()}>
      <DialogTitle>
        Add User
      </DialogTitle>
      <DialogContent>
        <UserAutocomplete
          label="User"
          onChange={handleUserChange}
        />
        <FormControl variant="outlined" className="add-user__select">
          <InputLabel id="add-user-role">Role</InputLabel>
          <Select
            labelId="add-user-role"
            label="Role"
            onChange={handleRoleChange}
            value={role}
            variant="outlined"
          >
            <MenuItem value="clinician">Clinician</MenuItem>
            <MenuItem value="bioinformatician">Bioinformatician</MenuItem>
            <MenuItem value="analyst">Analyst</MenuItem>
            <MenuItem value="reviewer">Reviewer</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onAdd()}>
          Cancel
        </Button>
        <Button
          color="secondary"
          disabled={!user || !role}
          onClick={handleAddUser}
        >
          Add User
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserDialog;
