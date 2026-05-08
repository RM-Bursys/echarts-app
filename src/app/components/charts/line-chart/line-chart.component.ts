import {
  Component,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  SimpleChanges,
} from '@angular/core';
import type { EChartsOption } from 'echarts';
import { BaseComponentComponent } from '../base-component/base-component.component';
import { monthlySalesData } from '../../../../data/sample-data';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.css',
})
export class LineChartComponent
  extends BaseComponentComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
  /** Override default height for this chart */
  override height = '100%';

  /** Allow parent to switch to dark theme */
  @Input() override theme: string = 'default';

  // ── Constructor ───────────────────────────────────────────────
  // Must call super() so the parent class is fully initialised
  // before any child logic runs.

  constructor() {
    super();
  }

  // ── Lifecycle ─────────────────────────────────────────────────
  // Call super.*() first in every override so the base chart
  // setup (init, resize, dispose) always runs before child logic.

  override ngAfterViewInit(): void {
    super.ngAfterViewInit(); // initialises ECharts instance
  }

  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes); // handles options/theme/loading changes
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy(); // disposes chart + removes ResizeObserver
  }

  ngOnInit(): void {
    // ngOnInit is NOT defined on the base, so no super call needed here.
    // Build the initial options; the base will apply them via
    // buildChartOptions() during AfterViewInit.
  }

  // ── Protected hook ────────────────────────────────────────────
  // The base calls this once inside initChart(). Return the full
  // ECharts option object here instead of assigning this.options
  // imperatively. Override in child components to customise.

  protected override buildChartOptions(): EChartsOption {
    const months  = monthlySalesData.map((d) => d.month);
    const revenue = monthlySalesData.map((d) => d.revenue);
    const units   = monthlySalesData.map((d) => d.units);
    return this.buildOptions(months, revenue, units);
  }

  // ── Override extension points (examples) ─────────────────────

  /** Extend parent event bindings with chart-specific ones. */
  protected override bindEvents(): void {
    super.bindEvents(); // keep click + mouseover from base
    // e.g. this.chartInstance?.on('legendselectchanged', ...);
  }

  // ── Private chart config ──────────────────────────────────────

  private buildOptions(
    months: string[],
    revenue: number[],
    units: number[]
  ): EChartsOption {
    return {
      title: {
        text: 'Monthly Sales Overview',
        subtext: 'Revenue (USD) & Units Sold — 2025',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: (params: any) => {
          const [rev, unit] = params;
          let html = '';
          if (rev && unit) {
            html = `
              <strong>${rev.axisValue}</strong><br/>
              ${rev.marker} Revenue: <b>$${rev.value.toLocaleString()}</b><br/>
              ${unit.marker} Units: <b>${unit.value}</b>
            `;
          } else if (rev) {
            html = `
              <strong>${rev.axisValue}</strong><br/>
              ${rev.marker} ${rev.seriesName}: <b>${typeof rev.value === 'number' ? `$${rev.value.toLocaleString()}` : rev.value}</b>
            `;
          } else if (unit) {
            html = `
              <strong>${unit.axisValue}</strong><br/>
              ${unit.marker} ${unit.seriesName}: <b>${unit.value}</b>
            `;
          }
          return html;
        },
      },
      legend: {
        bottom: 0,
        data: ['Revenue (USD)', 'Units Sold'],
      },
      grid: { left: '3%', right: '4%', bottom: '12%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: months,
        axisLine: { lineStyle: { color: '#aaa' } },
      },
      yAxis: [
        {
          type: 'value',
          name: 'Revenue (USD)',
          nameLocation: 'middle',
          nameGap: 60,
          axisLabel: { formatter: (v: number) => `$${(v / 1000).toFixed(0)}k` },
        },
        {
          type: 'value',
          name: 'Units Sold',
          nameLocation: 'middle',
          nameGap: 45,
          axisLabel: { formatter: (v: number) => `${v}` },
        },
      ],
      series: [
        {
          name: 'Revenue (USD)',
          type: 'line',
          smooth: true,
          yAxisIndex: 0,
          data: revenue,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { width: 3, color: '#5470C6' },
          itemStyle: { color: '#5470C6' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(84,112,198,0.35)' },
                { offset: 1, color: 'rgba(84,112,198,0.02)' },
              ],
            },
          },
        },
        {
          name: 'Units Sold',
          type: 'line',
          smooth: true,
          yAxisIndex: 1,
          data: units,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { width: 3, color: '#EE6666', type: 'dashed' },
          itemStyle: { color: '#EE6666' },
        },
      ],
    };
  }
}
