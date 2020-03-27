import React, { useState } from 'react';
import {
  Button,
  IconButton,
} from '@material-ui/core';
import {
  Edit,
} from '@material-ui/icons';

/**
 * @param {object} params params
 * @param {string} params.value display text
 * @param {string} props.link target link
 * @return {*} JSX
 */
function ActionCellRenderer(params) {
  const {
    data,
    context: { editable },
    api,
    columnApi,
  } = params;
  console.log(params);


  return (
    <span>
      {editable && (
        <IconButton size="small" aria-label="Edit">
          <Edit />
        </IconButton>
      )}
      {data.svg && (
        <Button>
          Image
        </Button>
      )}
      <Button>
        Details
      </Button>
    </span>
  );
}

export default ActionCellRenderer;
