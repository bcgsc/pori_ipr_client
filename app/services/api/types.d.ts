type CallOptionsType = {
  forceListReturn?: boolean;
  forceRecordReturn?: boolean;
  raw?: boolean;
  name?: string;
  confirm?: boolean
} | null;

type RequestReturnType = null | ResponseType | Record<string, unknown>[];

export {
  CallOptionsType,
  RequestReturnType,
};
