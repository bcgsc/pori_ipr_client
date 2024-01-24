type PrintVersion = 'stable' | 'beta' | null;

type SummaryProps = {
  templateName: string;
  isPrint: boolean;
  printVersion?: PrintVersion;
  loadedDispatch?: (type: Record<'type', string>) => void;
  [x: string]: unknown;
};

export {
  PrintVersion,
  SummaryProps,
};
