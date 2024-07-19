// source: https://github.com/iamhosseindhv/notistack/issues/30#issuecomment-542863653
import {
  useSnackbar,
  ProviderContext as WithSnackbarProps, // https://github.com/iamhosseindhv/notistack/issues/311
  OptionsObject,
  closeSnackbar,
} from 'notistack';
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

interface IProps {
  setUseSnackbarRef: (showSnackbar: WithSnackbarProps) => void
}

const InnerSnackbarUtilsConfigurator: React.FC<IProps> = ({ setUseSnackbarRef }: IProps) => {
  setUseSnackbarRef(useSnackbar());
  return null;
};

let useSnackbarRef: WithSnackbarProps;
const setUseSnackbarRef = (useSnackbarRefProp: WithSnackbarProps) => {
  useSnackbarRef = useSnackbarRefProp;
};

const Action = (snackbarId) => (
  <IconButton style={{ color: '#fff' }} aria-label="dismiss" onClick={() => { closeSnackbar(snackbarId); }}>
    <CloseIcon />
  </IconButton>
);

export const SnackbarUtilsConfigurator = () => <InnerSnackbarUtilsConfigurator setUseSnackbarRef={setUseSnackbarRef} />;

export default {
  success(msg: string, options: OptionsObject = {}) {
    this.toast(msg, { ...options, variant: 'success' });
  },
  warning(msg: string, options: OptionsObject = {}) {
    this.toast(msg, { ...options, variant: 'warning' });
  },
  info(msg: string, options: OptionsObject = {}) {
    this.toast(msg, { ...options, variant: 'info' });
  },
  error(msg: string, options: OptionsObject = {}) {
    this.toast(msg, { ...options, variant: 'error' });
  },
  toast(
    msg: string,
    {
      variant,
      ...rest
    }: OptionsObject,
  ) {
    useSnackbarRef.enqueueSnackbar(msg, { variant, action: Action, ...rest });
  },
};
