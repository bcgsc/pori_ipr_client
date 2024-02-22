import { useContext } from 'react';

import ReportContext, { ReportContextType } from '@/context/ReportContext';

const useReport = (): ReportContextType => useContext(ReportContext);

export default useReport;
