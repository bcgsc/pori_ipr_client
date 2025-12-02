import React, {
  useState, useEffect,
  useReducer,
  useCallback,
} from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Table,
  TableCell,
  TableRow,
  Typography,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TableBody,
  Stack,
} from '@mui/material';

import api, { ApiCallSet } from '@/services/api';
import AsyncButton from '@/components/AsyncButton';

import snackbar from '@/services/SnackbarUtils';
import { UserNotificationType, UserType } from '@/common';
import useSecurity from '@/hooks/useSecurity';

import './index.scss';
import { useMutation, useQuery } from 'react-query';
import capitalize from 'lodash/capitalize';
import { fetchTemplates } from '@/views/TemplateView';

const USER_NOTIFICATION_MAPPING = {
  userBound: 'User Bound',
  reportCreated: 'Report Created',
} as const;

type UserNotificationKeys = keyof typeof USER_NOTIFICATION_MAPPING;
interface TemplateState {
  templateName: string;
  enabled: boolean;
  notificationState: NotificationState;
}

interface ProjectState {
  projectName: string; // keep display name inside
  enabled: boolean;
  templates: Record<string, TemplateState>; // templateIdent as keys
}

interface NotificationState {
  userBound: boolean;
  reportCreated: boolean;
}

type ProjectTemplateNotificationState = Record<string, ProjectState>;

const initializeNotificationState = (
  projects: { ident: string; name: string }[],
  templates: { ident: string; name: string }[],
): ProjectTemplateNotificationState => projects.reduce((projectAcc, project) => {
  const templateMap = templates.reduce((templateAcc, template) => ({
    ...templateAcc,
    [template.ident]: {
      templateName: template.name,
      enabled: false,
      notificationState: {
        userBound: false,
        reportCreated: false,
      },
    },
  }), {} as Record<string, TemplateState>);

  return {
    ...projectAcc,
    [project.ident]: {
      projectName: project.name,
      enabled: false,
      templates: templateMap,
    },
  };
}, {} as ProjectTemplateNotificationState);

const getEnabledNotifications = (
  notificationState: ProjectTemplateNotificationState,
): Array<{
  projectIdent: string;
  templateIdent: string;
  notifications: NotificationState;
}> => {
  const result: Array<{
    projectIdent: string;
    templateIdent: string;
    notifications: NotificationState;
  }> = [];

  Object.entries(notificationState).forEach(([projectIdent, projectState]) => {
    Object.entries(projectState.templates).forEach(([templateIdent, templateState]) => {
      const { notificationState: notif } = templateState;

      const hasEnabled = Object.keys(USER_NOTIFICATION_MAPPING).some(
        (key) => notif[key as UserNotificationKeys],
      );

      if (hasEnabled) {
        result.push({
          projectIdent,
          templateIdent,
          notifications: notif,
        });
      }
    });
  });

  return result;
};

const getDisabledNotification = ({
  notificationState,
  existingNotifications,
}: {
  notificationState: ProjectTemplateNotificationState;
  existingNotifications: UserNotificationType[];
}): string[] => {
  const deletions: string[] = [];

  existingNotifications.forEach((notif) => {
    const {
      project, template, eventType, ident,
    } = notif;

    const projectState = notificationState[project.ident];
    const templateState = projectState?.templates?.[template.ident];
    const isToggleOn = templateState?.notificationState?.[eventType as UserNotificationKeys];

    if (!isToggleOn) {
      deletions.push(ident);
    }
  });
  return deletions;
};

const updateUserNotificationsCall = async ({
  notificationState,
  userIdent,
}: {
  notificationState: ProjectTemplateNotificationState;
  userIdent: string;
}) => {
  const enabledNotifications = getEnabledNotifications(notificationState);
  const calls = [];
  for (const { projectIdent, templateIdent, notifications } of enabledNotifications) {
    for (const eventType of Object.keys(USER_NOTIFICATION_MAPPING) as UserNotificationKeys[]) {
      if (notifications[eventType]) {
        const formData = new FormData();
        formData.append('eventType', eventType);
        formData.append('user', userIdent);
        formData.append('project', projectIdent);
        formData.append('template', templateIdent);

        calls.push(api.post('/notification/notifications', {
          eventType,
          user: userIdent,
          project: projectIdent,
          template: templateIdent,
        }));
      }
    }
  }
  const callSet = new ApiCallSet(calls);
  return callSet.request();
};

const deleteUserNotificationsCall = async ({
  notificationState,
  existingNotifications,
}: {
  notificationState: ProjectTemplateNotificationState;
  existingNotifications: UserNotificationType[];
}) => {
  const toDelete = getDisabledNotification({
    notificationState,
    existingNotifications,
  });
  const calls = [];
  for (const notificationIdent of toDelete) {
    calls.push(api.del('/notification/notifications', {
      ident: notificationIdent,
    }));
  }
  const callSet = new ApiCallSet(calls);
  const res = await callSet.request();
  return res;
};

type ProjectTemplateNotificationAction =
  | { type: 'setProjectToggle'; projectIdent: string; value: boolean }
  | { type: 'setTemplateToggle'; projectIdent: string; templateIdent: string; value: boolean }
  | { type: 'setTemplateNotif'; projectIdent: string; templateIdent: string; key: UserNotificationKeys; value: boolean }
  | { type: 'reset'; initialState: ProjectTemplateNotificationState }
  | { type: 'hydrate'; notifications: UserNotificationType[] };

const projectTemplateNotifReducer = (
  state: ProjectTemplateNotificationState,
  action: ProjectTemplateNotificationAction,
): ProjectTemplateNotificationState => {
  switch (action.type) {
    case 'setProjectToggle':
      return {
        ...state,
        [action.projectIdent]: {
          ...state[action.projectIdent],
          enabled: action.value,
        },
      };

    case 'setTemplateToggle':
      return {
        ...state,
        [action.projectIdent]: {
          ...state[action.projectIdent],
          templates: {
            ...state[action.projectIdent].templates,
            [action.templateIdent]: {
              ...state[action.projectIdent].templates[action.templateIdent],
              enabled: action.value,
            },
          },
        },
      };

    case 'setTemplateNotif':
      return {
        ...state,
        [action.projectIdent]: {
          ...state[action.projectIdent],
          templates: {
            ...state[action.projectIdent].templates,
            [action.templateIdent]: {
              ...state[action.projectIdent].templates[action.templateIdent],
              notificationState: {
                ...state[action.projectIdent].templates[action.templateIdent].notificationState,
                [action.key]: action.value,
              },
            },
          },
        },
      };

    case 'hydrate': {
      const { notifications } = action;

      const newState = { ...state };

      notifications.forEach((notif) => {
        const projectIdent = notif.project.ident;
        const templateIdent = notif.template.ident;
        const eventType = notif.eventType as UserNotificationKeys;

        if (
          newState[projectIdent]
          && newState[projectIdent].templates[templateIdent]
        ) {
          const templateState = newState[projectIdent].templates[templateIdent];

          // Enable the notification toggle
          templateState.notificationState[eventType] = true;

          // Enable the template
          templateState.enabled = true;

          // Enable the project
          newState[projectIdent].enabled = true;
        }
      });

      return newState;
    }

    case 'reset':
      return action.initialState;

    default:
      return state;
  }
};

const REPORT_TYPES_TO_TOGGLE = ['genomic', 'pharmacogenomic', 'probe', 'rapid'];

const fetchNotifications = async (id) => api.get(`/notification/notifications?user=${id}`, {}).request();

type UserSettingsDialogProps = {
  editData: Partial<UserType>;
  isOpen: boolean;
  onClose: (newData?: Partial<UserType>) => void;
};

const UserSettingsDialog = ({
  editData,
  isOpen = false,
  onClose,
}: UserSettingsDialogProps): JSX.Element => {
  const { userDetails, userDetails: { projects = [] } } = useSecurity();
  const [allowNotifs, setAllowNotifs] = useState(false);
  const [notificationState, dispatchNotification] = useReducer(
    projectTemplateNotifReducer,
    {},
  );

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
    enabled: isOpen,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', userDetails.ident],
    queryFn: () => fetchNotifications(userDetails.ident),
    enabled: isOpen && Boolean(userDetails),
  });

  useEffect(() => {
    if (editData) {
      setAllowNotifs(editData.allowNotifications);
    }
  }, [editData]);

  useEffect(() => {
    if (projects.length > 0 && templates.length > 0) {
      const initialState = initializeNotificationState(projects, templates);

      dispatchNotification({
        type: 'reset',
        initialState,
      });
    }
    if (notifications.length) {
      dispatchNotification({
        type: 'hydrate',
        notifications,
      });
    }
  }, [projects, templates, notifications]);

  const { mutate: updateUserSettings, isLoading: isUserSettingLoading } = useMutation({
    mutationFn: async () => {
      if (allowNotifs === userDetails.allowNotifications) {
        return Promise.resolve('no-change');
      }
      const req = api.put(
        `/user/${editData.ident}/notifications`,
        { allowNotifications: allowNotifs },
        {},
      );
      return req.request();
    },
    onSuccess: () => {
      onClose({ ...editData, allowNotifications: allowNotifs });
      snackbar.success('User Settings updated successfully.');
    },
    onError: (err: Error) => {
      snackbar.error(`Error updating user settings: ${err.message}`);
      onClose();
    },
  });

  const { mutate: updateUserNotifications, isLoading: isUpdateUserNotifLoading } = useMutation({
    mutationFn: () => updateUserNotificationsCall({ notificationState, userIdent: userDetails.ident }),
    onSuccess: () => {
      snackbar.success('Notifications updated successfully.');
    },
    onError: (err: Error) => {
      snackbar.error(`Error updating notifications: ${err.message}`);
    },
  });

  const { mutate: deleteUserNotifications, isLoading: isDeleteUserNotifLoading } = useMutation({
    mutationFn: () => deleteUserNotificationsCall({ existingNotifications: notifications, notificationState }),
    onSuccess: () => {
      snackbar.success('Notifications removed successfully.');
    },
    onError: (err: Error) => {
      snackbar.error(`Error deleting notifications: ${err.message}`);
    },
  });

  const { mutate: sendTestEmail, isLoading: isSendTestEmailLoading } = useMutation({
    mutationFn: async () => {
      const req = api.get('/email', {});
      return req.request();
    },
    onSuccess: () => {
      snackbar.success('Test email sent successfully.');
    },
    onError: (err: Error) => {
      snackbar.error(`Error sending test email: ${err.message}`);
    },
  });

  const isApiCalling = isUserSettingLoading
  || isSendTestEmailLoading
  || isDeleteUserNotifLoading
  || isUpdateUserNotifLoading;

  const handleSubmit = useCallback(() => {
    updateUserSettings();
    updateUserNotifications();
    deleteUserNotifications();
  }, [deleteUserNotifications, updateUserNotifications, updateUserSettings]);

  const handleTestEmail = () => {
    sendTestEmail();
  };

  return (
    <Dialog open={isOpen} maxWidth="sm" fullWidth className="user-profile">
      <DialogTitle>User Profile</DialogTitle>
      <DialogContent>
        <Table size="medium">
          <TableBody>
            {userDetails && (
              <>
                <TableRow>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">Username</Typography>
                  </TableCell>
                  <TableCell sx={{ paddingLeft: 1, width: '80%' }}>
                    {userDetails.username}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">First Name</Typography>
                  </TableCell>
                  <TableCell sx={{ paddingLeft: 1 }}>
                    {userDetails.firstName}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">Last Name</Typography>
                  </TableCell>
                  <TableCell sx={{ paddingLeft: 1 }}>
                    {userDetails.lastName}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">Email</Typography>
                  </TableCell>
                  <TableCell sx={{ paddingLeft: 1 }}>
                    {userDetails.email}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">Projects</Typography>
                  </TableCell>
                  <TableCell sx={{ paddingLeft: 1 }}>
                    {userDetails.projects.map(({ name }, index, arr) => (
                      <React.Fragment key={`${name}-${arr.toString()}`}>
                        {name}
                        {(index < arr.length - 1 ? ', ' : '')}
                      </React.Fragment>
                    ))}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">Groups</Typography>
                  </TableCell>
                  <TableCell sx={{ paddingLeft: 1 }}>
                    {userDetails.groups.map(({ name }, index, arr) => (
                      <React.Fragment key={`${name}-${arr.toString()}`}>
                        {name}
                        {(index < arr.length - 1 ? ', ' : '')}
                      </React.Fragment>
                    ))}
                  </TableCell>
                </TableRow>
              </>
            )}
            <TableRow>
              <TableCell colSpan={2} padding="normal">
                <Accordion elevation={0} square expanded={allowNotifs}>
                  <AccordionSummary>
                    <FormControlLabel
                      label={`Allow email notifications to ${editData.email}`}
                      control={<Switch checked={allowNotifs} onChange={(event) => setAllowNotifs(event.target.checked)} />}
                    />
                  </AccordionSummary>
                  <AccordionDetails sx={{ marginLeft: '1rem' }}>
                    {Object.entries(notificationState).map(([projectId, { projectName, enabled: projectEnabled, templates: mappedTemplates }]) => (
                      <Accordion key={projectId} elevation={0} square expanded={projectEnabled}>
                        <AccordionSummary>
                          <FormControlLabel
                            label={`Subscribe to ${projectName}`}
                            control={(
                              <Switch
                                checked={projectEnabled}
                                onChange={(event) => dispatchNotification({
                                  type: 'setProjectToggle',
                                  projectIdent: projectId,
                                  value: event.target.checked,
                                })}
                              />
                              )}
                          />
                        </AccordionSummary>
                        <AccordionDetails sx={{ marginLeft: '1rem' }}>
                          {Object.entries(mappedTemplates).filter(([, { templateName }]) => REPORT_TYPES_TO_TOGGLE.includes(templateName)).map(([templateId, {
                            templateName, enabled: templateEnabled, notificationState: notifState,
                          }]) => (
                            <Accordion key={templateId} elevation={0} square expanded={templateEnabled}>
                              <AccordionSummary>
                                <FormControlLabel
                                  label={`${capitalize(templateName)} reports`}
                                  control={(
                                    <Switch
                                      checked={templateEnabled}
                                      onChange={(event) => dispatchNotification({
                                        type: 'setTemplateToggle',
                                        projectIdent: projectId,
                                        templateIdent: templateId,
                                        value: event.target.checked,
                                      })}
                                    />
                                    )}
                                />
                              </AccordionSummary>
                              <AccordionDetails sx={{ marginLeft: '1rem' }}>
                                <Stack direction="column">
                                  {
                                      (Object.keys(USER_NOTIFICATION_MAPPING) as UserNotificationKeys[]).map((k) => (
                                        <FormControlLabel
                                          key={`${templateId}${k}`}
                                          label={USER_NOTIFICATION_MAPPING[k]}
                                          control={(
                                            <Switch
                                              checked={notifState[k]}
                                              onChange={(event) => dispatchNotification({
                                                type: 'setTemplateNotif',
                                                projectIdent: projectId,
                                                templateIdent: templateId,
                                                key: k,
                                                value: event.target.checked,
                                              })}
                                            />
                                            )}
                                        />
                                      ))
                                    }
                                </Stack>
                              </AccordionDetails>
                            </Accordion>
                          ))}
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </AccordionDetails>
                </Accordion>
                {allowNotifs && (
                  <AsyncButton variant="outlined" isLoading={isApiCalling} color="info" onClick={handleTestEmail}>
                    <Typography variant="caption">Send me a test notification</Typography>
                  </AsyncButton>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions className="edit-dialog__actions" disableSpacing>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <AsyncButton isLoading={isApiCalling} color="primary" onClick={handleSubmit}>
          Save
        </AsyncButton>
      </DialogActions>
    </Dialog>
  );
};

export default UserSettingsDialog;
