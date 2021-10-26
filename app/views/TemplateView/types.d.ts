import { ImageType, RecordDefaults } from '@/common';

type TemplateType = {
  headerImage: ImageType;
  logoImage: ImageType;
  name: string;
  organization: string | null;
  sections: string[];
} & RecordDefaults;

export default TemplateType;
