import React, { useEffect, useState, useContext } from 'react';
import {
  Typography,
  Divider,
} from '@mui/material';

import api from '@/services/api';
import ReportContext from '@/context/ReportContext';
import snackbar from '@/services/SnackbarUtils';
import DemoDescription from '@/components/DemoDescription';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import CommentCard from './components/CommentCard';
import AddComment from './components/AddComment';

import './index.scss';

type DiscussionProps = WithLoadingInjectedProps;

const Discussion = ({
  isLoading,
  setIsLoading,
}: DiscussionProps): JSX.Element => {
  const { report } = useContext(ReportContext);

  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const commentsResp = await api.get(`/reports/${report.ident}/presentation/discussion`, {}).request();
          setComments(commentsResp);
        } catch (err) {
          snackbar.error(`Network error: ${err}`);
        } finally {
          setIsLoading(false);
        }
      };
      getData();
    }
  }, [report, setIsLoading]);

  const handleCommentEdited = (newComment) => {
    setComments((prevComments) => prevComments.reduce((accumulator, current) => {
      if (current.ident === newComment.ident) {
        accumulator.push(newComment);
      } else {
        accumulator.push(current);
      }
      return accumulator;
    }, []));
  };
  
  const handleCommentAdded = (newComment) => {
    setComments((prevComments) => [...prevComments, newComment]);
  };

  const handleCommentDeleted = (ident: string) => {
    setComments((prevComments) => prevComments.filter((comment) => comment.ident !== ident));
  };

  return (
    <div className="discussion">
      <div className="discussion__title">
        <Typography
          variant="h5"
        >
          Tumour Board Discussion Notes
        </Typography>
        <DemoDescription>
          This section is for the reporting of notes from the molecular tumour board discussion.
          These generally include a summary of the points of discussion and any therapies that will
          be pursued based on the sequencing results.
        </DemoDescription>
      </div>
      {!isLoading && (
        <div className="discussion__content">
          {comments.length ? (
            <div className="discussion__cards">
              {comments.map((comment) => (
                <CommentCard
                  key={comment.ident}
                  comment={comment}
                  onDelete={handleCommentDeleted}
                  onSave={handleCommentEdited}
                />
              ))}
            </div>
          ) : (
            <Typography align="center" className="discussion__none">No comments yet</Typography>
          )}
          <Divider />
          <AddComment
            onAdd={handleCommentAdded}
          />
        </div>
      )}
    </div>
  );
};

export default withLoading(Discussion);
