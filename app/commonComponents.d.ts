type SummaryProps = {
  templateName: string;
  isPrint: boolean;
  printVersion?: 'stable' | 'beta' | null;
  loadedDispatch?: (type: Record<'type', string>) => void;
  [x: string]: unknown;
};

export {
  SummaryProps,
};
