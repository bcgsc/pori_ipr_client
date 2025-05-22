import { KbMatchedStatementType } from '@/common';
import React, {
  createContext, useContext,
} from 'react';

type KbMatchesMoveDialogContextType = {
  moveKbMatchesDialogOpen: boolean,
  setMoveKbMatchesDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
  moveKbMatchesTableName: string,
  setMoveKbMatchesTableName: React.Dispatch<React.SetStateAction<string>>,
  selectedRows: [],
  setSelectedRows: React.Dispatch<React.SetStateAction<KbMatchedStatementType[]>>,
  selectedKbIdToIprMapping: Record<string, string>,
  destinationType: 'kbMatches' | 'rapidSummary',
  setDestinationType: React.Dispatch<React.SetStateAction<KbMatchesMoveDialogContextType['destinationType']>>,
};

const KbMatchesMoveDialogContext = createContext<KbMatchesMoveDialogContextType>({
  moveKbMatchesDialogOpen: false,
  setMoveKbMatchesDialogOpen: () => {},
  moveKbMatchesTableName: '',
  setMoveKbMatchesTableName: () => {},
  selectedRows: null,
  setSelectedRows: () => {},
  selectedKbIdToIprMapping: {},
  destinationType: 'kbMatches',
  setDestinationType: () => {},
});

export const useKbMatches = () => useContext(KbMatchesMoveDialogContext);
export {
  KbMatchesMoveDialogContext,
  KbMatchesMoveDialogContextType,
};
