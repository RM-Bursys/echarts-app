# ECharts + Gridster Dashboard

This project demonstrates how to combine `echarts`, `ag-grid-angular`, and `angular-gridster2` in an Angular app to build a customizable analytics dashboard driven by mock data.

The app provides:

- Multiple ECharts-based widgets: line, pie, bar, and area charts
- An AG Grid-based table widget using the same shared dataset
- A Gridster-powered dashboard layout
- Edit mode for drag/resize customization
- Dynamic cell sizing based on the available viewport area
- Boundary and viewport restrictions so widgets stay inside the visible dashboard
- Toast feedback when space is not available for new widgets

## Tech stack

- Angular 18
- ECharts 6
- AG Grid 35
- angular-gridster2 18
- TypeScript

## Project structure

- `src/app/app.component.ts` - dashboard state, Gridster configuration, edit mode, sizing, placement rules
- `src/app/components/charts/base-component/base-component.component.ts` - reusable base wrapper for ECharts
- `src/app/components/charts/line-chart/line-chart.component.ts` - line chart implementation
- `src/app/components/charts/bar-chart/bar-chart.component.ts` - bar chart implementation
- `src/app/components/charts/pie-chart/pie-chart.component.ts` - pie chart implementation
- `src/app/components/charts/area-chart/area-chart.component.ts` - area chart implementation
- `src/app/components/charts/ag-grid/ag-grid.component.ts` - AG Grid widget implementation
- `src/data/sample-data.ts` - mock monthly sales dataset

## Mock data used in the dashboard

The charts are built from a simple monthly sales dataset with:

- `month`
- `revenue`
- `units`

Example shape:

```ts
export interface MonthlySales {
	month: string;
	revenue: number;
	units: number;
}
```

This makes it easy to swap mock data with API data later without changing the dashboard architecture.

## How AG Grid is used

AG Grid is added as another dashboard widget, just like the chart widgets, and it uses the same `monthlySalesData` source.

### AG Grid widget responsibilities

The grid component handles:

- rendering tabular mock sales data
- column sizing and responsive layout
- sorting and filtering
- row selection
- theme customization
- reuse inside Gridster cells

### Data used by AG Grid

The AG Grid widget reads the same shared dataset from `src/data/sample-data.ts`:

- `month`
- `revenue`
- `units`

This keeps chart widgets and table widgets aligned on the same business data.

### Main AG Grid configuration used

Inside `AgGridComponent`, the main pieces are:

- `rowData` - binds the shared mock data array
- `columnDefs` - describes the visible columns
- `defaultColDef` - sets shared column behavior
- `gridOptions` - configures table-level behavior
- `theme` - applies AG Grid theme customization

### Current AG Grid column setup

The current widget defines:

- `month` - pinned text column
- `revenue` - numeric column with currency formatting
- `units` - numeric column for units sold

### Useful AG Grid customization options

You can customize AG Grid through `columnDefs`, `defaultColDef`, and `gridOptions`.

Common column options:

- `field`
- `headerName`
- `type`
- `pinned`
- `minWidth` / `maxWidth`
- `flex`
- `sortable`
- `filter`
- `resizable`
- `editable`
- `valueFormatter`
- `cellRenderer`
- `cellStyle`
- `valueGetter`

Common grid options:

- `animateRows`
- `rowSelection`
- `pagination`
- `paginationPageSize`
- `domLayout`
- `suppressMovableColumns`
- `suppressCellFocus`
- `rowHeight`
- `headerHeight`
- `overlayLoadingTemplate`
- `overlayNoRowsTemplate`
- `onGridReady`
- `onCellClicked`
- `onRowSelected`

### AG Grid theme customization

The widget currently uses `themeQuartz.withParams(...)` to customize the look.

Examples of theme properties you can adjust:

- `accentColor`
- `borderColor`
- `headerBackgroundColor`
- `headerTextColor`
- `wrapperBorderRadius`
- `oddRowBackgroundColor`
- `rowHoverColor`
- `browserColorScheme`

### AG Grid methods and extension ideas

Typical AG Grid features you can add next:

- inline editing
- pagination
- quick filter search
- CSV export
- column show/hide controls
- row grouping
- pinned summary rows
- server-side or API-backed data loading

### How AG Grid is added to Gridster

The AG Grid widget is integrated exactly like the charts:

1. create the standalone widget component
2. import it into `app.component.ts`
3. add a sidebar option in `chartOptions`
4. render it in the Gridster `@switch` block
5. let Gridster manage placement, sizing, resize, and edit mode behavior

## How ECharts is used

ECharts is wrapped in a reusable base component so all chart types can share setup logic.

### Base chart responsibilities

The base component handles:

- ECharts instance creation
- Theme support
- Renderer selection (`canvas` or `svg`)
- Loading state handling
- Resize observation
- Event binding
- Safe disposal on destroy

### Common inputs in the base component

Available in `BaseComponentComponent`:

- `options` - full ECharts option object
- `mergeOptions` - partial option updates
- `theme` - theme name or custom theme
- `width` - chart width
- `height` - chart height
- `loading` - show/hide loading overlay
- `loadingText` - loading label
- `renderer` - `canvas` or `svg`
- `autoResize` - resize chart with container

### Common outputs in the base component

- `chartInit` - emits the initialized ECharts instance
- `chartClick` - emits click events
- `chartMouseover` - emits mouseover events

### Useful base methods

- `setOption(option, opts)` - apply a full or merged ECharts option
- `resize()` - manually resize chart instance
- `getInstance()` - access raw ECharts instance
- `buildChartOptions()` - override in child charts to return chart config
- `bindEvents()` - extend chart event registration
- `toggleLoading()` - customize loading behavior

### How a chart is customized

Each chart component extends the base component and overrides `buildChartOptions()`.

Typical customization includes:

- `title`
- `tooltip`
- `legend`
- `grid`
- `xAxis` / `yAxis`
- `series`
- line style, area style, colors, symbols, and labels

## How Gridster is used

Gridster is used to build the draggable, resizable dashboard surface.

### Current dashboard behavior

The dashboard is configured as a fixed visible grid:

- `visibleGridCols = 4`
- `visibleGridRows = 4`
- edit-only resizing and dragging
- grid lines shown only in edit mode
- widgets restricted to the visible dashboard area

### Important Gridster options used

In `gridOptions`, the project uses:

- `gridType: 'fixed'` - both width and height are controlled explicitly
- `compactType: 'compactLeft'` - packs widgets toward the left
- `displayGrid` - toggled between `'always'` and `'none'`
- `enableBoundaryControl: true` - keeps interaction within the grid bounds
- `draggable.enabled` - allows moving widgets only in edit mode
- `resizable.enabled` - allows resizing widgets only in edit mode
- `minCols`, `maxCols` - fixed visible column count
- `minRows`, `maxRows` - fixed visible row count
- `fixedColWidth`, `fixedRowHeight` - recalculated dynamically from viewport size
- `maxItemCols`, `maxItemRows` - restricts how large a widget can become
- `margin`, `outerMargin*` - spacing between cells and grid edges
- `disableScrollHorizontal`, `disableScrollVertical` - prevents overflow scrolling
- `itemValidateCallback` - blocks moves/resizes that exceed the visible dashboard

## Dynamic viewport sizing

The grid cell size is not hardcoded to the screen. Instead, it is recalculated from the remaining visible dashboard space.

The sizing flow is:

1. Measure the available dashboard viewport
2. Subtract grid margins and outer spacing
3. Divide remaining width by visible columns
4. Divide remaining height by visible rows
5. Apply the result to:
	 - `fixedColWidth`
	 - `fixedRowHeight`

This ensures widgets do not grow beyond the space left after sidebar and toolbar layout constraints.

### Methods involved in sizing and layout refresh

- `ngAfterViewInit()` - starts resize observation and initial layout calculation
- `attachGridResizeObserver()` - watches the dashboard viewport for size changes
- `refreshGridLayout(delay)` - schedules Gridster refresh after UI changes
- `updateGridCellSize()` - recalculates cell width and height dynamically
- `toggleSidebar()` - refreshes layout after sidebar collapse/expand

## Edit mode behavior

Widgets are customizable only in edit mode.

### `toggleEditMode()`

This method controls:

- `editMode` state
- widget dragging enable/disable
- widget resizing enable/disable
- grid line visibility
- Gridster option refresh

Behavior:

- Edit mode `true`
	- drag enabled
	- resize enabled
	- grid lines visible
	- remove button visible
- Edit mode `false`
	- drag disabled
	- resize disabled
	- grid lines hidden
	- remove button hidden

## Widget placement and space validation

The app prevents hidden or off-screen widgets from being added.

### Methods used for placement control

- `addChart(type)` - adds a chart only if space is available
- `createChartItem(type)` - creates the default widget config
- `findAvailablePosition(item)` - searches the visible grid for free space
- `isItemWithinVisibleGrid(item)` - validates row/column boundaries
- `itemsOverlap(a, b)` - detects overlap with existing widgets
- `removeChart(index)` - removes a widget and refreshes layout

### No-space handling

If the visible grid is full, the widget is not added and the user is notified with a toast message.

## User feedback utilities

### `showToast(message)`

Used to display short feedback such as:

- chart already exists
- no space available in the current view

## Default widget size

New widgets currently start with:

- `cols: 2`
- `rows: 2`

These defaults are defined in `createChartItem()`.

## Ways to customize further

You can extend this dashboard in several ways.

### ECharts customization ideas

- Replace mock data with API responses
- Add more chart types like scatter, radar, gauge, or heatmap
- Inject dynamic themes
- Add legend filters and toolbox actions
- Update charts live with `mergeOptions`
- Handle click or hover events using `chartClick` and `chartMouseover`

### Gridster customization ideas

- Change visible grid size by updating `visibleGridCols` and `visibleGridRows`
- Change default widget size in `createChartItem()`
- Allow more or fewer resize limits with `maxItemCols` and `maxItemRows`
- Change compaction behavior with `compactType`
- Enable or disable widget swapping
- Persist dashboard layout in local storage or a backend
- Restore saved layouts on app load

### AG Grid customization ideas

- Add editable columns for `revenue` and `units`
- Add pagination for longer datasets
- Add quick search and floating filters
- Add export buttons for CSV
- Add custom cell renderers for badges or trends
- Add row grouping by quarter or category
- Replace `monthlySalesData` with API data

## How to add a new widget

### Add a new chart widget

1. Create a new chart component extending `BaseComponentComponent`
2. Override `buildChartOptions()`
3. Register the component in `app.component.ts`
4. Add a new entry to `chartOptions`
5. Render it in the `@switch` block inside the dashboard template

### Add a new AG Grid-style table widget

1. Create a standalone component using `AgGridAngular`
2. Bind `rowData` to a shared or API-backed dataset
3. Define `columnDefs`, `defaultColDef`, and `gridOptions`
4. Import the component in `app.component.ts`
5. Add a sidebar option and a Gridster `@case` branch

## Run the project

Install dependencies:

```bash
npm install
```

Start locally:

```bash
npm start
```

Build:

```bash
npm run build
```

Test:

```bash
npm test
```

## Summary

This project uses:

- ECharts for rich, reusable chart widgets
- AG Grid for interactive table widgets
- Gridster for a customizable dashboard layout
- Mock monthly sales data for demonstration
- Angular standalone components for modular structure

Together, they provide a clean base for building a customizable analytics or operations dashboard.
