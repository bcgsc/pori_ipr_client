import { RecordDefaults, UserType } from '@/common';

type SignatureType = ({
  authorSignature: null | UserType;
  authorSignedAt: null | string;
  reviewerSignature: null | UserType;
  reviewerSignedAt: null | string;
} & RecordDefaults) | null;

export default SignatureType;
