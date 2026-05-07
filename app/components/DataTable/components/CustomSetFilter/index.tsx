import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  IAfterGuiAttachedParams,
  IDoesFilterPassParams,
  IFilterParams,
} from '@ag-grid-community/core';

import './index.scss';

const CustomSetFilter = forwardRef((props: IFilterParams, ref) => {
  const { api, column } = props;

  const [textFilter, setTextFilter] = useState('');
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());
  const [uniqueValues, setUniqueValues] = useState<string[]>([]);

  const selectAllRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const filterChangedCallbackRef = useRef(props.filterChangedCallback);
  filterChangedCallbackRef.current = props.filterChangedCallback;
  const isFirstRender = useRef(true);
  const isSettingModel = useRef(false);

  useEffect(() => {
    const allValues = new Set<string>();
    api.forEachNode((node) => {
      const value = api.getValue(column, node);
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((val: string) => allValues.add(val));
        } else {
          allValues.add(String(value));
        }
      }
    });
    setUniqueValues(Array.from(allValues).sort());
  }, [api, column]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isSettingModel.current) {
      isSettingModel.current = false;
      return;
    }
    filterChangedCallbackRef.current();
  }, [textFilter, selectedValues]);

  const selectAllState = useMemo(() => {
    if (selectedValues.size === 0) return 'none';
    if (selectedValues.size === uniqueValues.length) return 'all';
    return 'some';
  }, [selectedValues, uniqueValues]);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectAllState === 'some';
    }
  }, [selectAllState]);

  const isFilterActive = useCallback(
    () => selectedValues.size > 0 || !!textFilter,
    [selectedValues, textFilter],
  );

  useImperativeHandle(ref, () => ({
    doesFilterPass(params: IDoesFilterPassParams) {
      const value = api.getValue(column, params.node)?.toString() ?? '';
      const matchesText = textFilter
        ? value.toLowerCase().includes(textFilter.toLowerCase())
        : true;
      const matchesCheckbox = selectedValues.size > 0
        ? Array.from(selectedValues).some((item) => value.includes(item))
        : true;
      return matchesText && matchesCheckbox;
    },
    isFilterActive,
    getModel() {
      if (!isFilterActive()) return null;
      return { values: Array.from(selectedValues), text: textFilter };
    },
    setModel(model: { values?: string[]; text?: string } | null) {
      isSettingModel.current = true;
      if (model) {
        setSelectedValues(new Set(model.values ?? []));
        setTextFilter(model.text ?? '');
      } else {
        setSelectedValues(new Set());
        setTextFilter('');
      }
    },
    afterGuiAttached(params?: IAfterGuiAttachedParams) {
      if (!params?.suppressFocus) {
        textInputRef.current?.focus();
      }
    },
  }));

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValues(e.target.checked ? new Set(uniqueValues) : new Set());
  };

  const handleCheckbox = (value: string, checked: boolean) => {
    setSelectedValues((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(value);
      } else {
        next.delete(value);
      }
      return next;
    });
  };

  return (
    <div className="matches-filter">
      <input
        ref={textInputRef}
        type="text"
        placeholder="Search text..."
        className="text-filter-input"
        value={textFilter}
        onChange={(e) => setTextFilter(e.target.value)}
      />
      <div className="custom-filter">
        <div id="selectAllWrapper">
          <label htmlFor="selectAllCheckbox">
            <input
              ref={selectAllRef}
              id="selectAllCheckbox"
              type="checkbox"
              checked={selectAllState === 'all'}
              onChange={handleSelectAll}
            />
            (Select All)
          </label>
        </div>
        <div id="checkboxContainer">
          {uniqueValues.map((value) => (
            <div key={value}>
              <label htmlFor={`checkbox-${value}`}>
                <input
                  type="checkbox"
                  id={`checkbox-${value}`}
                  value={value}
                  checked={selectedValues.has(value)}
                  onChange={(e) => handleCheckbox(value, e.target.checked)}
                />
                {value}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

CustomSetFilter.displayName = 'CustomSetFilter';

export default CustomSetFilter;
