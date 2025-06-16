import type {
  IAfterGuiAttachedParams, IDoesFilterPassParams, IFilterComp, IFilterParams,
} from '@ag-grid-community/core';

import './index.scss';

export default class CustomSetFilter implements IFilterComp {
  filterParams!: IFilterParams;

  uniqueValues: Set<string> = new Set();

  selectedValues: Set<string> = new Set();

  gui!: HTMLDivElement;

  eSelectAllCheckbox!: HTMLInputElement;

  init(params: IFilterParams) {
    this.filterParams = params;
    this.uniqueValues.clear();
    this.selectedValues.clear();
    this.setupGui(params);
    this.collectUniqueValues(params);
  }

  // Collect all unique values from the column
  collectUniqueValues(params: IFilterParams) {
    const allValues = new Set<string>();

    // Collect unique values for this column
    params.api.forEachNode((node) => {
      const value = params.valueGetter(node);
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((val: string) => allValues.add(val));
        } else {
          allValues.add(value);
        }
      }
    });

    const sortedValues = Array.from(allValues).sort();
    const sortedValuesSet = new Set(sortedValues);

    this.uniqueValues = sortedValuesSet;
  }

  // Set up the GUI with checkboxes for each unique value
  setupGui(params: IFilterParams) {
    this.collectUniqueValues(params);
    this.gui = document.createElement('div');
    this.gui.classList.add('matches-filter');
    this.gui.innerHTML = `
      <div class="custom-filter">
        <div id="filterHeader">Matches Filter</div>
        <div id="selectAllWrapper">
          <input type="checkbox" id="selectAllCheckbox" />
          <label for="selectAllCheckbox" id="selectAllLabel">(Select All)</label>
        </div>
        <div id="checkboxContainer"></div>
      </div>
    `;

    // "Select All" checkbox logic
    this.eSelectAllCheckbox = this.gui.querySelector('#selectAllCheckbox') as HTMLInputElement;
    this.eSelectAllCheckbox.addEventListener('change', (event) => {
      const isChecked = (event.target as HTMLInputElement).checked;
      if (isChecked) {
        this.selectAllValues();
      } else {
        this.deselectAllValues();
      }
      params.filterChangedCallback();
    });

    const checkboxContainer = this.gui.querySelector('#checkboxContainer') as HTMLDivElement;

    // Create a checkbox for each unique value
    this.uniqueValues.forEach((value) => {
      const checkboxWrapper = document.createElement('div');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = value;
      checkbox.id = `checkbox-${value}`;

      // Handle checkbox change
      checkbox.addEventListener('change', (event) => {
        const isChecked = (event.target as HTMLInputElement).checked;
        if (isChecked) {
          this.selectedValues.add(value);
        } else {
          this.selectedValues.delete(value);
        }

        // Update "Select All" checkbox state
        this.updateSelectAllCheckboxState();

        params.filterChangedCallback();
      });

      const label = document.createElement('label');
      label.setAttribute('for', checkbox.id);
      label.textContent = value;
      checkboxWrapper.appendChild(checkbox);
      checkboxWrapper.appendChild(label);
      checkboxContainer.appendChild(checkboxWrapper);
    });
  }

  getGui() {
    return this.gui;
  }

  // Select all values (check all checkboxes)
  selectAllValues() {
    this.uniqueValues.forEach((value) => {
      this.selectedValues.add(value);
    });
    this.updateCheckboxes();
  }

  // Deselect all values (uncheck all checkboxes)
  deselectAllValues() {
    this.selectedValues.clear();
    this.updateCheckboxes();
  }

  // Logic to check if the row passes the filter based on selected values
  doesFilterPass(params: IDoesFilterPassParams) {
    const { node } = params;
    const value = this.filterParams.valueGetter(node).toString();
    return Array.from(this.selectedValues).some((item) => value.includes(item));
  }

  isFilterActive() {
    return this.selectedValues.size > 0;
  }

  getModel() {
    if (!this.isFilterActive()) {
      return null;
    }

    return { values: Array.from(this.selectedValues) };
  }

  setModel(model) {
    if (model && model.values) {
      this.selectedValues = new Set(model.values);
      this.updateCheckboxes();
    }
  }

  // Sync checkboxes with selected values
  updateCheckboxes() {
    const checkboxes = this.gui.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach((checkbox) => {
      const { value } = checkbox;
      // eslint-disable-next-line no-param-reassign
      checkbox.checked = Array.from(this.selectedValues).some((item) => value.includes(item));
    });

    // Update "Select All" checkbox state
    this.updateSelectAllCheckboxState();
  }

  // Update "Select All" checkbox state
  updateSelectAllCheckboxState() {
    const checkboxes = this.gui.querySelectorAll('input[type="checkbox"]:not(#selectAllCheckbox)') as NodeListOf<HTMLInputElement>;
    const totalCheckboxes = checkboxes.length;
    const checkedCheckboxes = Array.from(checkboxes).filter((checkbox) => checkbox.checked).length;

    if (checkedCheckboxes === 0) {
      this.eSelectAllCheckbox.checked = false;
      this.eSelectAllCheckbox.indeterminate = false;
    } else if (checkedCheckboxes === totalCheckboxes) {
      this.eSelectAllCheckbox.checked = true;
      this.eSelectAllCheckbox.indeterminate = false;
    } else {
      this.eSelectAllCheckbox.checked = false;
      this.eSelectAllCheckbox.indeterminate = true;
    }
  }

  afterGuiAttached(params?: IAfterGuiAttachedParams): void {
    if (params && !params.suppressFocus) {
      const checkboxes = this.gui.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
      if (checkboxes.length > 0) {
        checkboxes[0].focus();
      }
    }
  }
}
