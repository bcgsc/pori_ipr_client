import { useQuery } from 'react-query';
import { ReportType } from '@/common';
import api from '@/services/api';
import { SignatureUserType } from '@/components/SignatureCard';

const DEFAULT_SIGNATURE_TYPES = [
  { signatureType: 'author' },
  { signatureType: 'reviewer' },
  { signatureType: 'creator' },
] as SignatureUserType[];

const useSignatureTypes = (report?: ReportType) => useQuery({
  queryKey: ['signature-types', report?.template?.ident],
  enabled: Boolean(report?.template?.ident),
  queryFn: async () => {
    const resp = await api.get(`/templates/${report!.template.ident}/signature-types`).request();
    return resp?.length === 0 ? DEFAULT_SIGNATURE_TYPES : resp;
  },
  staleTime: Infinity,
});

export default useSignatureTypes;
export {
  useSignatureTypes,
  DEFAULT_SIGNATURE_TYPES,
};
