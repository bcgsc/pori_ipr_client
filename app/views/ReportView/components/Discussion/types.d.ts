import { RecordDefaults, UserType } from '@/common';

type DiscussionType = {
  body: string;
  user: UserType;
} & RecordDefaults;

export default DiscussionType;
