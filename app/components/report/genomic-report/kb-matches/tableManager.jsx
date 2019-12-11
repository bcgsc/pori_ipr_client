class TableManager {
  constructor(tables, init = { gridApi: null, columnApi: null, showPopOver: null }) {
    this.tables = tables.reduce((obj, val) => ({
      ...obj,
      [val]: init,
    }), {});

    Object.values(this.tables).map((val) => {
      val.onGridReady = (params) => {
        val.gridApi = params.api;
        val.columnApi = params.columnApi;
        val.gridApi.sizeColumnsToFit();
      };
      return val;
    });
  }

  getTables() {
    return this.tables;
  }

  getTable(table) {
    return this.tables[table];
  }

  getTableProp(table, prop) {
    return this.tables[table][prop];
  }

  setTableProp(table, prop, value) {
    this.tables[table][prop] = value;
    return this.tables[table];
  }
}

export default TableManager;
