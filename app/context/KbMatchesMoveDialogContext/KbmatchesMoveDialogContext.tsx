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
};

const KbMatchesMoveDialogContext = createContext<KbMatchesMoveDialogContextType>({
  moveKbMatchesDialogOpen: false,
  setMoveKbMatchesDialogOpen: () => {},
  moveKbMatchesTableName: '',
  setMoveKbMatchesTableName: () => {},
  selectedRows: null,
  setSelectedRows: () => {},
  selectedKbIdToIprMapping: {},
});

export const useKbMatches = () => useContext(KbMatchesMoveDialogContext);
export {
  KbMatchesMoveDialogContext,
  KbMatchesMoveDialogContextType,
};
