import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LineChartComponent } from './components/charts/line-chart/line-chart.component';
import { PieChartComponent } from './components/charts/pie-chart/pie-chart.component';
import { BarChartComponent } from './components/charts/bar-chart/bar-chart.component';
import { AreaChartComponent } from './components/charts/area-chart/area-chart.component';
import { GridsterModule, GridsterConfig, GridsterItem } from 'angular-gridster2';

export interface DashboardItem extends GridsterItem {
  type: string;
}

export interface ChartOption {
  type: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    LineChartComponent,
    PieChartComponent,
    BarChartComponent,
    AreaChartComponent,
    GridsterModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  title = 'echarts-app';
  sidebarOpen = true;
  editMode = false;
  toast: string | null = null;
  private toastTimer: any;
  @ViewChild('gridsterHost', { read: ElementRef })
  private gridsterHost?: ElementRef<HTMLElement>;

  private readonly visibleGridCols = 4;
  private readonly maxChartCols = 4;
  private readonly maxChartRows = 4;
  private readonly visibleGridRows = 4;
  private resizeObserver: ResizeObserver | null = null;
  private refreshFrame: number | null = null;

  chartOptions: ChartOption[] = [
    { type: 'line',  label: 'Line Chart',  icon: '📈' },
    { type: 'pie',   label: 'Pie Chart',   icon: '🥧' },
    { type: 'bar',   label: 'Bar Chart',   icon: '📊' },
    { type: 'area',  label: 'Area Chart',  icon: '🏔️' },
  ];

  gridOptions: GridsterConfig = {
    gridType: 'fixed',
    compactType: 'compactLeft',
    displayGrid: 'none',
    setGridSize: true,
    enableBoundaryControl: true,
    draggable: { enabled: false },
    resizable: { enabled: false },
    minCols: this.visibleGridCols,
    maxCols: this.visibleGridCols,
    minRows: this.visibleGridRows,
    maxRows: this.visibleGridRows,
    fixedColWidth: 160,
    fixedRowHeight: 160,
    defaultItemCols: 3,
    defaultItemRows: 1,
    maxItemCols: this.maxChartCols,
    maxItemRows: this.maxChartRows,
    margin: 10,
    outerMargin: true,
    outerMarginTop: 10,
    outerMarginRight: 10,
    outerMarginBottom: 10,
    outerMarginLeft: 10,
    pushItems: true,
    swap: false,
    disableScrollHorizontal: true,
    disableScrollVertical: true,
    scrollToNewItems: true,
    keepFixedHeightInMobile: false,
    keepFixedWidthInMobile: false,
    itemValidateCallback: (item: GridsterItem) => this.isItemWithinVisibleGrid(item),
  };

  dashboard: Array<DashboardItem> = [];

  ngAfterViewInit(): void {
    this.attachGridResizeObserver();
    this.refreshGridLayout();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    if (this.refreshFrame !== null) {
      cancelAnimationFrame(this.refreshFrame);
      this.refreshFrame = null;
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    this.refreshGridLayout(300);
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    this.gridOptions.draggable!.enabled = this.editMode;
    this.gridOptions.resizable!.enabled = this.editMode;
    this.gridOptions.displayGrid = this.editMode ? 'always' : 'none';
    // Always notify Gridster immediately so all option changes are applied.
    this.gridOptions.api?.optionsChanged?.();
    this.refreshGridLayout();
  }

  isAdded(type: string): boolean {
    return this.dashboard.some(item => item.type === type);
  }

  addChart(type: string) {
    if (this.isAdded(type)) {
      this.showToast(`${this.chartOptions.find(c => c.type === type)?.label} is already on the dashboard.`);
      return;
    }
    const newItem = this.createChartItem(type);
    const nextPosition = this.findAvailablePosition(newItem);

    if (!nextPosition) {
      this.showToast('No space is available in the current dashboard view. Resize, move, or remove a widget to add another.');
      return;
    }

    this.dashboard = [...this.dashboard, {
      ...newItem,
      ...nextPosition,
    }];
    this.refreshGridLayout();
  }

  removeChart(index: number) {
    this.dashboard = this.dashboard.filter((_, itemIndex) => itemIndex !== index);
    this.refreshGridLayout();
  }

  showToast(message: string) {
    this.toast = message;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toast = null; }, 3000);
  }

  private createChartItem(type: string): DashboardItem {
    return {
      cols: 2,
      rows: 2,
      y: 0,
      x: 0,
      type,
      maxItemCols: this.maxChartCols,
      maxItemRows: this.maxChartRows,
    };
  }

  private attachGridResizeObserver(): void {
    const host = this.gridsterHost?.nativeElement;
    if (!host) {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => {
      const changed = this.updateGridCellSize();
      if (changed) {
        this.gridOptions.api?.optionsChanged?.();
      }
      this.gridOptions.api?.resize?.();
    });

    this.resizeObserver.observe(host);
  }

  private refreshGridLayout(delay = 0): void {
    window.setTimeout(() => {
      if (this.refreshFrame !== null) {
        cancelAnimationFrame(this.refreshFrame);
      }

      this.refreshFrame = requestAnimationFrame(() => {
        const changed = this.updateGridCellSize();
        if (changed) {
          this.gridOptions.api?.optionsChanged?.();
        }
        this.gridOptions.api?.resize?.();
        this.refreshFrame = null;
      });
    }, delay);
  }

  private updateGridCellSize(): boolean {
    const host = this.gridsterHost?.nativeElement;
    const hostWidth = host?.clientWidth ?? 0;
    const hostHeight = host?.clientHeight ?? 0;
    if (!hostWidth || !hostHeight) {
      return false;
    }

    const margin = this.gridOptions.margin ?? 0;
    const outerTop = this.gridOptions.outerMarginTop ?? 0;
    const outerRight = this.gridOptions.outerMarginRight ?? 0;
    const outerBottom = this.gridOptions.outerMarginBottom ?? 0;
    const outerLeft = this.gridOptions.outerMarginLeft ?? 0;

    const reservedHorizontalSpace = outerLeft + outerRight + (this.visibleGridCols - 1) * margin;
    const reservedVerticalSpace = outerTop + outerBottom + (this.visibleGridRows - 1) * margin;

    const nextColWidth = Math.max(
      80,
      Math.floor((hostWidth - reservedHorizontalSpace) / this.visibleGridCols)
    );
    const nextRowHeight = Math.max(
      80,
      Math.floor((hostHeight - reservedVerticalSpace) / this.visibleGridRows)
    );

    let changed = false;

    if (this.gridOptions.fixedColWidth !== nextColWidth) {
      this.gridOptions.fixedColWidth = nextColWidth;
      changed = true;
    }

    if (this.gridOptions.fixedRowHeight !== nextRowHeight) {
      this.gridOptions.fixedRowHeight = nextRowHeight;
      changed = true;
    }

    return changed;
  }

  private isItemWithinVisibleGrid(item: GridsterItem): boolean {
    return item.x >= 0 &&
      item.y >= 0 &&
      item.cols >= 1 &&
      item.rows >= 1 &&
      item.cols <= this.maxChartCols &&
      item.rows <= this.maxChartRows &&
      item.x + item.cols <= this.visibleGridCols &&
      item.y + item.rows <= this.visibleGridRows;
  }

  private findAvailablePosition(item: GridsterItem): Pick<GridsterItem, 'x' | 'y'> | null {
    for (let y = 0; y <= this.visibleGridRows - item.rows; y++) {
      for (let x = 0; x <= this.visibleGridCols - item.cols; x++) {
        const candidate: GridsterItem = { ...item, x, y };

        if (!this.isItemWithinVisibleGrid(candidate)) {
          continue;
        }

        const overlaps = this.dashboard.some((existingItem) => this.itemsOverlap(existingItem, candidate));
        if (!overlaps) {
          return { x, y };
        }
      }
    }

    return null;
  }

  private itemsOverlap(a: GridsterItem, b: GridsterItem): boolean {
    return a.x < b.x + b.cols &&
      a.x + a.cols > b.x &&
      a.y < b.y + b.rows &&
      a.y + a.rows > b.y;
  }
}
