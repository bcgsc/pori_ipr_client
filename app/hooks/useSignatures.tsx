import { useQuery } from 'react-query';
import { ReportType } from '@/context/ReportContext';
import api from '@/services/api';
import { SignatureType } from '@/components/SignatureCard';

const useSignatures = (report?: ReportType) => useQuery<SignatureType>({
  queryKey: ['report-signatures', report?.ident],
  enabled: Boolean(report),
  queryFn: () => api.get(`/reports/${report?.ident}/signatures`).request(),
});

export default useSignatures;
