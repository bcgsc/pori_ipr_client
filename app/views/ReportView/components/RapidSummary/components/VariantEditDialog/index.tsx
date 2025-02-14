import React, {
  useState, useEffect, useContext, useCallback, useMemo,
} from 'react';
import {
  DialogTitle,
  DialogContent,
  Dialog,
  DialogProps,
  TextField,
  DialogActions,
  Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/HighlightOff';
import ReportContext from '@/context/ReportContext';
import ConfirmContext from '@/context/ConfirmContext';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import api, { ApiCallSet } from '@/services/api';
import { KbMatchedStatementType, KbMatchType } from '@/common';
import { Box } from '@mui/system';
import { RapidVariantType } from '../../types';
import { getVariantRelevanceDict } from '../../utils';

const KbMatchesTable = ({ kbMatches, onDelete }: {
  kbMatches: KbMatchType[],
  onDelete: (ident: string) => void;
}) => {
  const handleKbMatchDelete = useCallback((ident) => () => {
    if (onDelete && ident) {
      onDelete(ident);
    }
  }, [onDelete]);

  const kbMatchesTable = useMemo(() => {
    if (!kbMatches) { return null; }
    const sorted = getVariantRelevanceDict(kbMatches);
    const sortedStatements = {};
    Object.entries(sorted).forEach(([relevance, matches]) => {
      matches.forEach((match) => {
        for (const statement of match.kbMatchedStatements) {
          if (!sortedStatements[relevance]) {
            sortedStatements[relevance] = [statement];
          } else if (!sortedStatements[relevance].some((item: KbMatchedStatementType) => item.ident === statement.ident)) {
            sortedStatements[relevance].push(statement);
          }
        }
      });
    });
    return Object.entries(sortedStatements)
      .sort(([relevance1], [relevance2]) => (relevance1 > relevance2 ? 1 : -1))
      .map(([relevance, matches]: [relevance: string, matches: KbMatchedStatementType[]]) => (
        <TableRow key={relevance + matches.toString()}>
          <TableCell>{relevance}</TableCell>
          <TableCell>
            {
              matches.map((match) => (
                <Chip
                  key={match.ident}
                  label={`${match.context} ${match.iprEvidenceLevel ? `(${match.iprEvidenceLevel})` : ''}`}
                  deleteIcon={<DeleteIcon />}
                  onDelete={handleKbMatchDelete(match.ident)}
                />
              ))
            }
          </TableCell>
        </TableRow>
      ));
  }, [kbMatches, handleKbMatchDelete]);

  return (
    <Box my={1}>
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: '#ddd' }}>
            <TableRow>
              <TableCell>Relevance</TableCell>
              <TableCell>Drugs</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {kbMatchesTable}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

const VARIANT_TYPE_TO_API_MAP = {
  cnv: 'copy-variants',
  mut: 'small-mutations',
  sv: 'structural-variants',
};

enum FIELDS {
  'comments',
  'kbMatches',
}

interface VariantEditDialogProps extends DialogProps {
  editData: RapidVariantType & { potentialClinicalAssociation?: string };
  onClose: (newData: boolean) => void;
  fields?: Array<FIELDS>;
}

const VariantEditDialog = ({
  onClose,
  open,
  editData,
  fields = [FIELDS.comments],
}: VariantEditDialogProps) => {
  const { report } = useContext(ReportContext);
  const { isSigned } = useContext(ConfirmContext);
  const { showConfirmDialog } = useConfirmDialog();
  const [data, setData] = useState(editData);
  const [editDataDirty, setEditDataDirty] = useState<boolean>(false);

  useEffect(() => {
    if (editData) {
      setData(editData);
    }
  }, [editData]);

  const handleDataChange = useCallback((
    { target: { value, name } },
  ) => {
    setData((prevVal) => ({ ...prevVal, [name]: value }));
    if (!editDataDirty) {
      setEditDataDirty(true);
    }
  }, [editDataDirty]);

  const handleKbMatchDelete = useCallback((kbMatchStatementId) => {
    const updatedKbMatches = data?.kbMatches.map((kbMatch) => {
      const updatedStatements = kbMatch.kbMatchedStatements.filter(({ ident }) => kbMatchStatementId !== ident);
      return { ...kbMatch, kbMatchedStatements: updatedStatements };
    });
    handleDataChange({
      target: {
        value: updatedKbMatches,
        name: 'kbMatches',
      },
    });
  }, [data?.kbMatches, handleDataChange]);

  const handleSave = useCallback(async () => {
    if (editDataDirty) {
      let variantId = data?.ident;
      // The relevance was appeneded to Id due to row concatenation, needs to be removed here to call API
      if ((data).potentialClinicalAssociation) {
        variantId = variantId.substr(0, variantId.lastIndexOf('-'));
      }

      const calls = [];

      if (fields.includes(FIELDS.comments) && data?.comments) {
        calls.push(api.put(
          `/reports/${report.ident}/${VARIANT_TYPE_TO_API_MAP[data.variantType]}/${variantId}`,
          {
            comments: data.comments,
          },
        ));
      }

      if (fields.includes(FIELDS.kbMatches) && data?.kbMatches && editData?.kbMatches) {
        const existingIds = [].concat(...editData.kbMatches.map((match) => match.kbMatchedStatements.map(({ ident }) => ident)));
        data?.kbMatches.forEach((kbMatch) => {
          const remainingIds = new Set(kbMatch.kbMatchedStatements.map(({ ident }) => ident));
          existingIds.filter((id) => !remainingIds.has(id)).forEach((stmtId) => {
            calls.push(api.del(`/reports/${report.ident}/kb-matches/kb-matched-statements/${stmtId}`, {}));
          });
        });
      }

      const callSet = new ApiCallSet(calls);

      if (isSigned) {
        showConfirmDialog(callSet);
      } else {
        await callSet.request();
        onClose(true);
      }
    } else {
      onClose(null);
    }
  }, [editDataDirty, data, fields, isSigned, report.ident, editData?.kbMatches, showConfirmDialog, onClose]);

  const handleDialogClose = useCallback(() => onClose(null), [onClose]);

  const kbMatchesField = () => {
    if (!fields.includes(FIELDS.kbMatches)) {
      return null;
    }
    return (
      <KbMatchesTable kbMatches={data?.kbMatches} onDelete={handleKbMatchDelete} />
    );
  };

  return (
    <Dialog fullWidth maxWidth="xl" open={open}>
      <DialogTitle>
        Edit Event
      </DialogTitle>
      <DialogContent className="patient-dialog__content">
        {kbMatchesField()}
        <TextField
          className="patient-dialog__text-field"
          label="comments"
          value={data?.comments ?? ''}
          name="comments"
          onChange={handleDataChange}
          variant="outlined"
          disabled={!fields.includes(FIELDS.comments)}
          multiline
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>
          Close
        </Button>
        <Button color="secondary" onClick={handleSave}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export {
  VariantEditDialog,
  FIELDS,
};
export default VariantEditDialog;
