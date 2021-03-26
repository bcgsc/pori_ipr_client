import React, {
  useState, useEffect,
} from 'react';
import ReactQuill from 'react-quill';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@material-ui/core';

import 'react-quill/dist/quill.snow.css';

type TextEditorProps = {
  analystComments: string;
  isOpen: boolean;
  onClose: (editedDate?: string) => void;
};

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],

    [{ 'header': 1 }, { 'header': 2 }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],

    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }],
    [{ 'align': [] }],

    ['clean'],

    ['link'],
  ],
};

const TextEditor = ({
  analystComments,
  isOpen,
  onClose,
}: TextEditorProps): JSX.Element => {
  const [editedComments, setEditedComments] = useState('');

  useEffect(() => {
    setEditedComments(analystComments);
  }, [analystComments]);

  return (
    <Dialog maxWidth="lg" open={isOpen} onClose={onClose}>
      <DialogTitle>Edit Comments</DialogTitle>
      <DialogContent>
        <ReactQuill
          theme="snow"
          modules={modules}
          value={editedComments}
          onChange={setEditedComments}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>
          Close
        </Button>
        <Button color="secondary" onClick={() => onClose(editedComments)}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TextEditor;
