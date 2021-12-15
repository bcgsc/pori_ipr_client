import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Typography,
} from '@mui/material';

import './index.scss';

type FeedbackDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const FeedbackDialog = ({
  isOpen,
  onClose,
}: FeedbackDialogProps): JSX.Element => (
  <Dialog open={isOpen} onClose={onClose}>
    <DialogTitle>Feedback and Bug Reports</DialogTitle>
    <DialogContent>
      <div className="feedback__section">
        <Typography variant="h5">Bug Reports</Typography>
        <Typography>
          When submitting a bug report, please include your browser version and the error context (the actions you took for the error to occur).
        </Typography>
        <Link href="https://whatismybrowser.com" target="_blank" underline="always">
          Click here to find your browser version.
        </Link>
      </div>
      <div className="feedback__section">
        <Typography variant="h5">Internal Users</Typography>
        <Typography>
          Please create a JIRA ticket under the DEVSU (Development Support) project containing your feedback or bug report.
        </Typography>
      </div>
      <div className="feedback__section">
        <Typography variant="h5">External Users</Typography>
        <Link
          href={`mailto:${window._env_.CONTACT_EMAIL}`}
          underline="always"
        >
          {`Click here to email ${window._env_.CONTACT_EMAIL} with your feedback or bug report.`}
        </Link>
      </div>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
      <Button
        color="secondary"
        href={window._env_.CONTACT_TICKET_URL}
        target="_blank"
      >
        Create Ticket
      </Button>
    </DialogActions>
  </Dialog>
);

export default FeedbackDialog;
