import React, {
  useState, useCallback,
} from 'react';
import ReactQuill, { ReactQuillProps } from 'react-quill';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import 'react-quill/dist/quill.snow.css';
import './index.scss';

const defaultQuillProps: ReactQuillProps = {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block', 'link'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ header: [1, 2, 3, false] }],
      ['clean'],
    ],
    clipboard: {
      // https://github.com/zenoamaro/react-quill/issues/281
      // https://stackoverflow.com/questions/63678128/how-to-prevent-react-quill-to-insert-a-new-line-before-list-when-re-loading-cont
      matchVisual: false,
    },
  },
  style: {
    fontFamily: 'Roboto',
    width: '100%',
  },
};

type AppendixEditorProps = {
  text: string;
  isOpen: boolean;
  // Returns null if nothing is edited
  onClose: (editedText?: string) => void;
  title?: string;
};

const AppendixEditor = ({
  text,
  isOpen,
  onClose,
  title = 'Edit Appendix',
}: AppendixEditorProps): JSX.Element => {
  const [editedText, setEditedText] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  const handleOnEdit = useCallback((nextValue, _delta, source) => {
    if (!isDirty && source !== 'api') { setIsDirty(true); }
    setEditedText(nextValue);
  }, [isDirty]);

  const handleOnSave = useCallback(() => {
    if (!isDirty) {
      onClose(null);
      return;
    }
    onClose(editedText);
  }, [isDirty, onClose, editedText]);

  return (
    <Dialog fullWidth maxWidth="lg" open={isOpen} onClose={() => onClose(null)}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <div className="AppendixEditor__container">
          <ReactQuill
            {...defaultQuillProps}
            theme="snow"
            defaultValue={text}
            onChange={handleOnEdit}

          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Close</Button>
        <Button color="secondary" onClick={handleOnSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppendixEditor;
export { AppendixEditorProps };
