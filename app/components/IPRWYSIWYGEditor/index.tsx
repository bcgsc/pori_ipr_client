import React, {
  forwardRef, useCallback, useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonProps,
  ToggleButtonGroup,
  Stack,
  Box,
} from '@mui/material';
import './index.scss';
import Underline from '@tiptap/extension-underline';
import {
  useEditor, EditorContent, Editor,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Code,
  FormatBold, FormatClear, FormatItalic, FormatListBulleted, FormatListNumbered, FormatQuote, FormatStrikethrough, FormatUnderlined, Redo, Undo,
} from '@mui/icons-material';
import { Prompt } from 'react-router-dom';

const extensions = [
  StarterKit,
  Underline,
];

const usePageLeaveWarning = (enabled) => {
  const handler = (e) => {
    e.preventDefault();
    e.returnValue = ''; // Required for Chrome
    return '';
  };
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('beforeunload', handler);
  }, [enabled]);
  return () => window.removeEventListener('beforeunload', handler);
};

const MenuBarButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  (props, ref) => <ToggleButton ref={ref} {...props} size="small" />,
);

type MenuBarProps = {
  editor: Editor,
  className: string,
};
const MenuBar = ({
  editor,
  className,
}: MenuBarProps) => {
  if (!editor) {
    return null;
  }

  return (
    <Box className={className}>
      <Stack direction="row" spacing={1}>
        <ToggleButtonGroup aria-label="Text formatting">
          <MenuBarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            value="bold"
            className={editor.isActive('bold') ? 'is-active' : ''}
            selected={editor.isActive('bold')}
          >
            <FormatBold />
          </MenuBarButton>
          <MenuBarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            value="italic"
            selected={editor.isActive('italic')}
          >
            <FormatItalic />
          </MenuBarButton>
          <MenuBarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            value="underline"
            selected={editor.isActive('underline')}
          >
            <FormatUnderlined />
          </MenuBarButton>
          <MenuBarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            value="strike"
            selected={editor.isActive('strike')}
          >
            <FormatStrikethrough />
          </MenuBarButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup>
          <MenuBarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            selected={editor.isActive('code')}
            value="code"
          >
            <Code />
          </MenuBarButton>
          <MenuBarButton
            value="blockquote"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            selected={editor.isActive('blockquote')}
          >
            <FormatQuote />
          </MenuBarButton>
        </ToggleButtonGroup>

        <ToggleButtonGroup>
          <MenuBarButton
            value="heading1"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            selected={editor.isActive('heading', { level: 1 })}
          >
            h1
          </MenuBarButton>
          <MenuBarButton
            value="heading2"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            selected={editor.isActive('heading', { level: 2 })}
          >
            h2
          </MenuBarButton>
          <MenuBarButton
            value="heading3"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            selected={editor.isActive('heading', { level: 3 })}
          >
            h3
          </MenuBarButton>
        </ToggleButtonGroup>

        <ToggleButtonGroup>
          <MenuBarButton
            value="bulletList"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            selected={editor.isActive('bulletList')}
          >
            <FormatListBulleted />
          </MenuBarButton>
          <MenuBarButton
            value="orderedList"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            selected={editor.isActive('orderedList')}
          >
            <FormatListNumbered />
          </MenuBarButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup>
          <MenuBarButton
            value="unsetAllMarks"
            aria-label="Clear all formats of selections"
            onClick={() => editor.chain().focus().clearNodes().run()}
          >
            <FormatClear />
          </MenuBarButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup>
          <MenuBarButton
            value="undo"
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo />
          </MenuBarButton>
          <MenuBarButton
            value="redo"
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo />
          </MenuBarButton>
        </ToggleButtonGroup>
      </Stack>
    </Box>
  );
};

type IPRWYSIWYGEditorProps = {
  /**
   * Prompts a confirm popup when user is middle of editing, but navigates away
   */
  alertLeave?: boolean;
  text: string;
  isOpen: boolean;
  // Returns null if nothing is edited
  onClose: (editedText?: string) => void;
  onSave?: (editedText?: string) => void;
  title?: string;
};

const IPRWYSIWYGEditor = ({
  alertLeave = false,
  text,
  isOpen,
  onClose,
  onSave,
  title = 'IPR WYSIWYG Editor',
}: IPRWYSIWYGEditorProps): JSX.Element => {
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const shouldWarnWhenUseLeave = alertLeave && isOpen && isDirty;
  usePageLeaveWarning(shouldWarnWhenUseLeave);

  const editor = useEditor({
    extensions,
    onUpdate: () => {
      setIsDirty(true);
    },
  });

  useEffect(() => {
    if (editor && text) {
      editor.commands.setContent(text);
    }
  }, [text, editor]);

  const handleOnSaveClose = useCallback(() => {
    if (editor) {
      onClose(editor.isEmpty ? '' : editor.getHTML());
    }
  }, [editor, onClose]);

  const handleOnSave = useCallback(() => {
    if (editor) {
      onSave(editor.isEmpty ? '' : editor.getHTML());
      setIsDirty(false);
    }
  }, [editor, onSave]);

  const handleOnClose = useCallback(() => {
    onClose(null);
    // Reset the editor text, since we don't deal with the state in React
    editor.commands.setContent(text);
  }, [onClose, editor, text]);

  const saveButton = useMemo(() => {
    if (onSave) {
      return <Button color="secondary" onClick={handleOnSave}>Save</Button>;
    }
    return null;
  }, [onSave, handleOnSave]);

  return (
    <>
      <Dialog fullWidth maxWidth="lg" open={isOpen}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <MenuBar editor={editor} className="IPRWYSIWYGEditor__toolbar" />
          <EditorContent editor={editor} className="IPRWYSIWYGEditor__content" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOnClose}>Close</Button>
          {saveButton}
          <Button color="secondary" onClick={handleOnSaveClose}>Save and Close</Button>
        </DialogActions>
      </Dialog>
      <Prompt
        when={shouldWarnWhenUseLeave}
        message="You have unsaved changes. Leave anyway?"
      />
    </>
  );
};

export default IPRWYSIWYGEditor;
export { IPRWYSIWYGEditorProps, MenuBar };
