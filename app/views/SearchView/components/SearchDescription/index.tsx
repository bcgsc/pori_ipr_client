import { Typography } from "@mui/material";
import React from "react";

const searchFeaturesDescription = () => {
  return (
    <>
      <Typography variant="subtitle1" color="inherit">
        The search feature allows users to retrieve reports containing information within the categories described below. 
        The components of a search chip include <b><em>Category</em></b>, <b><em>Keyword</em></b>, and <b><em>Matching Threshold</em></b>. 
        Users could stack search chips to create a more comprehensive search.
      </Typography>
      <br />
      <Typography variant="subtitle1" color="inherit">
        <b>Category - Patient ID:</b> Search for reports with matching POG ID.
      </Typography>
      <br />
      <Typography variant="subtitle1" color="inherit">
        <b>Category - Project Name:</b> Search for reports with matching project name.
      </Typography>
      <br />
      <Typography variant="subtitle1" color="inherit">
        <b>Category - Diagnosis:</b> Search for reports with fuzzy-matched dianosis.
      </Typography>
      <br />
      <Typography variant="subtitle1" color="inherit">
        <b>Category - Key Variant:</b> Search for reports with at least 1 matching key genomic alteration. Query column 'geneVariant' in 'Genomic and Transcriptomic Alterations Identified' table.
      </Typography>
      <br />
      <Typography variant="subtitle1" color="inherit">
        <b>Category - KB Variant:</b> Search for reports with at least 1 matching kb variant. Query column 'kbVariant' in 'Knowledgebase Matches' table.
      </Typography>
      <br />
      <Typography variant="subtitle1" color="inherit">
        <b>Category - Small Mutation:</b> Search for reports with at least 1 matching small mutation. Query column 'displayName' in 'Small Mutations' table.
      </Typography>
      <br />
      <Typography variant="subtitle1" color="inherit">
        <b>Category - Structural Variant:</b> Search for reports with at least 1 matching structural variant. Query column 'displayName' in 'Structural Variants' table.
      </Typography>
      <br />
      <Typography variant="subtitle1" color="inherit">
        <b>Category - Therapeutic Target:</b> Search for reports with at least 1 matching therapeutic target. Query column 'therapy' in 'Potential Therapeutic Targets' table.
      </Typography>
      <br />
      <Typography variant="subtitle1" color="inherit">
        <b>Matching Threshold:</b> The matching threshold defines how closely a search keyword must match a value, using a scale from 0 to 1. 
        A threshold of 1 requires an exact match, while lower values allow for partial similarity. If no threshold is set, the default is 0.8.
      </Typography>
    </>
  );
}

export default searchFeaturesDescription;