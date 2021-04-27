import { RecordDefaults, UserType } from '@/common';

type SlideType = {
  name: string;
  object: string;
  object_type: string;
  user: UserType;
} & RecordDefaults;

export default SlideType;
