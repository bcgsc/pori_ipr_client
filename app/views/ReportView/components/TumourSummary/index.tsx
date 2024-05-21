import React, {
  useState, useContext, useCallback,
} from 'react';
import {
  Typography,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ReportContext, { ReportType } from '@/context/ReportContext';
import {
  TumourSummaryType, MicrobialType, ImmuneType, MutationBurdenType, TmburType,
} from '@/common';
import TumourSummaryEdit from '@/components/TumourSummaryEdit';
import DescriptionList from '@/components/DescriptionList';
import SummaryPrintTable from '@/components/SummaryPrintTable';
import './index.scss';

type TumourSummaryProps = {
  canEdit: boolean;
  isPrint: boolean;
  printVersion?: 'standardLayout' | 'condensedLayout' | null;
  tumourSummary: TumourSummaryType[];
};

const TumourSummary = ({
  canEdit,
  isPrint,
  printVersion,
  tumourSummary,
}: TumourSummaryProps): JSX.Element => {
  const { report, setReport } = useContext(ReportContext);
  const [showTumourSummaryEdit, setShowTumourSummaryEdit] = useState(false);
  const [primaryBurden, setPrimaryBurden] = useState<MutationBurdenType>();
  const [tmburMutBur, setTmburMutBur] = useState<TmburType>();

  const [microbial, setMicrobial] = useState<MicrobialType[]>([{
    species: '',
    integrationSite: '',
    ident: '',
    createdAt: null,
    updatedAt: null,
  }]);
  const [tCellCd8, setTCellCd8] = useState<ImmuneType>();

  const classNamePrefix = isPrint ? 'tumour-summary--print' : 'tumour-summary';

  const handleTumourSummaryEditClose = useCallback((
    isSaved: boolean,
    newMicrobialData: MicrobialType[],
    newReportData: ReportType,
    newTCellCd8Data: ImmuneType,
    newMutationBurdenData: MutationBurdenType,
    newTmBurMutBurData: TmburType,
  ) => {
    setShowTumourSummaryEdit(false);

    if (!isSaved || (!newMicrobialData && !newReportData && !newTCellCd8Data && !newMutationBurdenData && !newTmBurMutBurData)) {
      return;
    }

    if (newMicrobialData) {
      setMicrobial(newMicrobialData);
    }

    if (newReportData) {
      setReport(newReportData);
    }

    if (newTCellCd8Data) {
      setTCellCd8(newTCellCd8Data);
    }

    if (newMutationBurdenData) {
      setPrimaryBurden(newMutationBurdenData);
    }

    if (newTmBurMutBurData) {
      setTmburMutBur(newTmBurMutBurData);
    }
  }, [setReport]);

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
          {canEdit && !isPrint && (
            <>
              <IconButton onClick={() => setShowTumourSummaryEdit(true)} size="large">
                <EditIcon />
              </IconButton>
              <TumourSummaryEdit
                microbial={microbial}
                report={report}
                tCellCd8={tCellCd8}
                mutationBurden={primaryBurden}
                tmburMutBur={tmburMutBur}
                isOpen={showTumourSummaryEdit}
                onClose={handleTumourSummaryEditClose}
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
