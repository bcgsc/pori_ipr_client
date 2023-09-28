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

import './index.scss';

const ALLOWED_FORMATS = [
  'align',
  'blockquote',
  'bold',
  'code-block',
  'direction',
  'header',
  'italic',
  'list',
  'script',
  'strike',
  'underline',
];

const defaultQuillProps: ReactQuillProps = {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ header: [1, 2, 3, false] }],
      ['clean'],
    ],
    clipboard: {
      // https://github.com/zenoamaro/react-quill/issues/281
      // https://stackoverflow.com/questions/63678128/how-to-prevent-react-quill-to-insert-a-new-line-before-list-when-re-loading-cont
      matchVisual: false,
    },
  },
};

type IPRWYSIWYGEditorProps = {
  text: string;
  isOpen: boolean;
  // Returns null if nothing is edited
  onClose: (editedText?: string) => void;
  title?: string;
};

const IPRWYSIWYGEditor = ({
  text,
  isOpen,
  onClose,
  title = 'IPR WYSIWYG Editor',
}: IPRWYSIWYGEditorProps): JSX.Element => {
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
        <div>
          <ReactQuill
            {...defaultQuillProps}
            theme="snow"
            defaultValue={text}
            onChange={handleOnEdit}
            formats={ALLOWED_FORMATS}
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

export default IPRWYSIWYGEditor;
export { IPRWYSIWYGEditorProps };
