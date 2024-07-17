import React, {
  useState, useCallback,
  useEffect,
} from 'react';
import {
  Typography,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { ReportType } from '@/context/ReportContext';
import {
  TumourSummaryType, MicrobialType, ImmuneType, MutationBurdenType, TmburType,
} from '@/common';
import { TumourSummaryEdit, TumourSummaryEditProps } from '@/components/TumourSummaryEdit';
import DescriptionList from '@/components/DescriptionList';
import SummaryPrintTable from '@/components/SummaryPrintTable';
import './index.scss';
import { SummaryProps } from '@/commonComponents';

interface TumourSummaryProps extends Omit<TumourSummaryEditProps, 'isOpen'> {
  canEdit: boolean;
  isPrint: boolean;
  printVersion?: 'standardLayout' | 'condensedLayout' | null;
  loadedDispatch: SummaryProps['loadedDispatch'];
  tumourSummary: TumourSummaryType[];
}

const TumourSummary = ({
  canEdit,
  onEditClose,
  mutationBurden,
  tmburMutBur,
  tCellCd8,
  loadedDispatch,
  microbial,
  report,
  isPrint,
  printVersion,
  tumourSummary,
}: TumourSummaryProps): JSX.Element => {
  const [showTumourSummaryEdit, setShowTumourSummaryEdit] = useState(false);
  const classNamePrefix = isPrint ? 'tumour-summary--print' : 'tumour-summary';

  const handleClose = useCallback((
    isSaved: boolean,
    newMicrobialData?: MicrobialType[],
    newReportData?: ReportType,
    newTCellCd8Data?: ImmuneType,
    newMutationBurdenData?: MutationBurdenType,
    newTmBurMutBurData?: TmburType,
  ) => {
    setShowTumourSummaryEdit(false);
    onEditClose(
      isSaved,
      newMicrobialData,
      newReportData,
      newTCellCd8Data,
      newMutationBurdenData,
      newTmBurMutBurData,
    );
  }, [onEditClose]);

  useEffect(() => {
    if (report && loadedDispatch) {
      loadedDispatch({ type: 'tumour' });
    }
  }, [report, loadedDispatch]);

  if (isPrint && printVersion === 'condensedLayout') {
    return (
      <div className={`${classNamePrefix}`}>
        <div className={`${classNamePrefix}__title`}>
          <Typography variant="h5" fontWeight="bold" display="inline">Tumour Summary</Typography>
        </div>
        <SummaryPrintTable
          data={tumourSummary}
          labelKey="term"
          valueKey="value"
        />
      </div>
    );
  }

  return (
    <div className={`${classNamePrefix}`}>
      <div className={`${classNamePrefix}__title`}>
        <Typography variant="h3">
          Tumour Summary
          {canEdit && !isPrint && report && (
            <>
              <IconButton onClick={() => setShowTumourSummaryEdit(true)} size="large">
                <EditIcon />
              </IconButton>
              <TumourSummaryEdit
                microbial={microbial}
                report={report}
                tCellCd8={tCellCd8}
                mutationBurden={mutationBurden}
                tmburMutBur={tmburMutBur}
                isOpen={showTumourSummaryEdit}
                onEditClose={handleClose}
              />
            </>
          )}
        </Typography>
      </div>
      <div className={`${classNamePrefix}__content`}>
        <DescriptionList entries={tumourSummary} />
      </div>
    </div>
  );
};

export default TumourSummary;
