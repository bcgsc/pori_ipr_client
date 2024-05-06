type SummaryProps = {
  templateName: string;
  isPrint: boolean;
  printVersion?: 'standardLayout' | 'condensedLayout' | null;
  loadedDispatch?: (type: Record<'type', string>) => void;
  [x: string]: unknown;
};

export {
  SummaryProps,
};
