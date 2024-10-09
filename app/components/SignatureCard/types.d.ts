import { RecordDefaults, UserType } from '@/common';

export type SignatureType = ({
  authorSignature: null | UserType;
  authorSignedAt: null | string;
  reviewerSignature: null | UserType;
  reviewerSignedAt: null | string;
  creatorSignature: null | UserType;
  creatorSignedAt: null | string;
} & RecordDefaults) | null;

export type SignatureUserType = {
  signatureType: null | string;
} & RecordDefaults;
