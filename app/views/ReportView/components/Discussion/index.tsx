import React, { useEffect, useState, useContext } from 'react';
import {
  Typography,
  Divider,
} from '@material-ui/core';

import api from '@/services/api';
import ReportContext from '@/components/ReportContext';
import CommentCard from './components/CommentCard';
import AddComment from './components/AddComment';

import './index.scss';

const Discussion = (): JSX.Element => {
  const { report } = useContext(ReportContext);

  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        const commentsResp = await api.get(`/reports/${report.ident}/presentation/discussion`, {}).request();
        setComments(commentsResp);
        setIsLoading(false);
      };
      getData();
    }
  }, [report]);

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

export default Discussion;
