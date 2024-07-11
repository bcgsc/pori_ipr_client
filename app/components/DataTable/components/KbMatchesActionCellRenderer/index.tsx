import {
  IconButton, Menu, MenuItem,
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import React, {
  useState, useCallback, useContext, useEffect,
} from 'react';
import api from '@/services/api';
import { KbMatchType } from '@/common';
import { useParams } from 'react-router-dom';
import snackbar from '@/services/SnackbarUtils';
import ReportContext from '@/context/ReportContext';
import TherapeuticType from '@/views/ReportView/components/TherapeuticTargets/types';
import {
  ActionCellRendererProps,
  ActionCellRenderer,
} from '../ActionCellRenderer';

const REPORT_TYPES_TO_SHOW_EXTRA_MENU = ['genomic'];

type TherapeuticTargetType = 'therapeutic' | 'chemoresistance';

const KbMatchesActionCellRenderer = (props: ActionCellRendererProps) => {
  const { ident: reportId } = useParams<{ ident: string }>();
  const { report: { template: { name: reportType } } } = useContext(ReportContext);
  const { data } = props;

  const {
    kbStatementId,
    iprEvidenceLevel,
  } = data as KbMatchType;
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement>();
  const [subMenuAnchor, setSubMenuAnchor] = useState<HTMLElement>();
  const [therapeuticTargetType, setTherapeuticTargetType] = useState<TherapeuticTargetType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [iprEvidenceLevels, setIprEvidenceLevels] = useState(null);
  const [isClinicalTrial, setIsClinicalTrial] = useState(false);

  const isMult = Array.isArray(kbStatementId);

  // Filtering whether a statement is clinical trial using context and recruitment status
  useEffect(() => {
    if (data.context.includes('Phase') || data.context.includes('Trial') || data.relevance === 'eligibility' || !!data.kbData.recruitment_status) {
      setIsClinicalTrial(true);
    }
  }, [data]);

  const handleUpdateTherapeuticTargets = useCallback((type: TherapeuticTargetType, selectedKbStatementId?: string) => async () => {
    const therapeuticResp = await api.get(`/reports/${reportId}/therapeutic-targets`, {}).request();
    let availableTherapeuticTargets: Partial<TherapeuticType>[];
    if (therapeuticResp) {
      availableTherapeuticTargets = therapeuticResp?.map(({
        ident, createdAt, updatedAt, rank, geneGraphkbId, kbStatementIds, notes, ...therapeuticTarget
      }) => therapeuticTarget);
    }

    if (!kbStatementId) { return null; }
    setIsLoading(true);
    try {
      let evidenceLevelsResp;
      let iprEvidenceLevelRid = null;
      if (!iprEvidenceLevels && iprEvidenceLevel) {
        evidenceLevelsResp = await api.get('/graphkb/evidence-levels', {}).request();
        setIprEvidenceLevels(evidenceLevelsResp.result ?? null);
        iprEvidenceLevelRid = evidenceLevelsResp?.result.find((res) => res.displayName === iprEvidenceLevel)?.['@rid'];
      } else {
        iprEvidenceLevelRid = iprEvidenceLevels.find((res) => res.displayName === iprEvidenceLevel)?.['@rid'];
      }
      const { result } = await api.get(`/graphkb/statements/${(selectedKbStatementId ?? kbStatementId as string).replace('#', '')}`, {}).request();

      if (result) {
        const variant = result[0].conditions.find((r) => r['@class'].toLowerCase().includes('variant'));
        const therapy = result[0].conditions.find((r) => r['@class'].toLowerCase().includes('therapy'));
        const context = result[0].relevance;

        if (!variant || !therapy || !context) {
          throw new Error(`Required Graphkb fields not populated on GraphKB: ${!variant ? ' variant' : ''}${!therapy ? ' therapy' : ''}${!context ? ' context' : ''}`);
        }

        // Add to targets regardless if it already exists, we don't know at this point without making another API call to search for all these params
        const newData: Partial<TherapeuticType> = {
          type,
          gene: variant.reference1 && variant.reference2
            ? `${variant.reference1.displayName}, ${variant.reference2.displayName}`
            : variant.reference1.displayName || variant.reference2.displayName,
          variant: variant['@class'].toLowerCase() === 'positionalvariant'
            ? variant.displayName.split(':').slice(1).join()
            : variant.type.displayName,
          variantGraphkbId: variant['@rid'],
          therapy: therapy.displayName,
          therapyGraphkbId: therapy['@rid'],
          context: context.displayName,
          contextGraphkbId: context['@rid'],
          evidenceLevel: null,
          evidenceLevelGraphkbId: null,
        };

        if (iprEvidenceLevelRid) {
          newData.evidenceLevel = iprEvidenceLevel;
          newData.evidenceLevelGraphkbId = iprEvidenceLevelRid;
        }

        if (!availableTherapeuticTargets.some((t) => t.gene === newData.gene && t.type === newData.type && t.variant === newData.variant && t.therapy === newData.therapy && t.evidenceLevel === newData.evidenceLevel)) {
          await api.post(`/reports/${reportId}/therapeutic-targets`, newData).request();
          snackbar.success(`Successfully added ${selectedKbStatementId ?? kbStatementId} to potential ${type}`);
        } else {
          snackbar.error('Statement already added to potential therapeutic targets.');
          return null;
        }
      }
    } catch (e) {
      if (e.status === 404) {
        snackbar.error(`Cannot find record, ${e.message}`);
      } else {
        snackbar.error(e.message);
      }
    } finally {
      setMenuAnchor(null);
      setSubMenuAnchor(null);
      setIsLoading(false);
    }
    return null;
  }, [iprEvidenceLevels, iprEvidenceLevel, kbStatementId, reportId]);

  const handleMultiTargets = useCallback((evt, type) => {
    setSubMenuAnchor(evt.currentTarget);
    setTherapeuticTargetType(type);
    return null;
  }, []);

  if (!REPORT_TYPES_TO_SHOW_EXTRA_MENU.includes(reportType)) {
    return <ActionCellRenderer {...props} />;
  }

  return (
    <>
      <IconButton
        onClick={(event) => setMenuAnchor(event.currentTarget)}
        size="small"
      >
        <MoreHorizIcon />
      </IconButton>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          disabled={isLoading || isClinicalTrial}
          onClick={isMult
            ? (evt) => handleMultiTargets(evt, 'therapeutic')
            : handleUpdateTherapeuticTargets('therapeutic')}
        >
          Add to Potential Therapeutic Targets
        </MenuItem>
        <MenuItem
          disabled={isLoading || isClinicalTrial}
          onClick={isMult
            ? (evt) => handleMultiTargets(evt, 'chemoresistance')
            : handleUpdateTherapeuticTargets('chemoresistance')}
        >
          Add to Potential Resistance and Toxicity
        </MenuItem>
        {
          isMult && (
          <Menu
            anchorEl={subMenuAnchor}
            open={Boolean(subMenuAnchor)}
            onClose={() => setSubMenuAnchor(null)}
          >
            {
              kbStatementId.map((kbId) => (
                <MenuItem
                  key={kbId}
                  disabled={isLoading}
                  onClick={handleUpdateTherapeuticTargets(therapeuticTargetType, kbId)}
                >
                  {kbId}
                </MenuItem>
              ))
            }
          </Menu>
          )
        }
        <ActionCellRenderer displayMode="menu" {...props} />
      </Menu>
    </>
  );
};

export default KbMatchesActionCellRenderer;
