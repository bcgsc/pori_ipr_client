import { RecordDefaults, UserType } from '@/common';

type CommentType = {
  body: string;
  user: UserType;
} & RecordDefaults;

export default CommentType;
