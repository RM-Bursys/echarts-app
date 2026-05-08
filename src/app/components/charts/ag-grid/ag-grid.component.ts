import { Component } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  AllCommunityModule,
  ColDef,
  ModuleRegistry,
  themeQuartz,
  type GridOptions,
} from 'ag-grid-community';
import { monthlySalesData, type MonthlySales } from '../../../../data/sample-data';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-ag-grid',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './ag-grid.component.html',
  styleUrl: './ag-grid.component.css',
})
export class AgGridComponent {
  protected readonly theme = themeQuartz.withParams({
    accentColor: '#5470c6',
    borderColor: '#d9dfef',
    headerBackgroundColor: '#eef2fb',
    headerTextColor: '#28304f',
    wrapperBorderRadius: 8,
    browserColorScheme: 'light',
    oddRowBackgroundColor: '#fafbff',
    rowHoverColor: '#edf2ff',
  });

  protected readonly rowData: MonthlySales[] = monthlySalesData;

  protected readonly columnDefs: Array<ColDef<MonthlySales>> = [
    {
      field: 'month',
      headerName: 'Month',
      pinned: 'left',
      minWidth: 110,
      maxWidth: 140,
    },
    {
      field: 'revenue',
      headerName: 'Revenue',
      type: 'numericColumn',
      valueFormatter: ({ value }) => typeof value === 'number' ? `$${value.toLocaleString()}` : '',
      minWidth: 150,
    },
    {
      field: 'units',
      headerName: 'Units Sold',
      type: 'numericColumn',
      minWidth: 130,
    },
  ];

  protected readonly defaultColDef: ColDef<MonthlySales> = {
    sortable: true,
    filter: true,
    resizable: true,
    editable: false,
    flex: 1,
    minWidth: 110,
  };

  protected readonly gridOptions: GridOptions<MonthlySales> = {
    animateRows: true,
    rowSelection: {
      mode: 'singleRow',
      checkboxes: false,
      enableClickSelection: true,
    },
    suppressMovableColumns: false,
    suppressCellFocus: true,
  };
}
