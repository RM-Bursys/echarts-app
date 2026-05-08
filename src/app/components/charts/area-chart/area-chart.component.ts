import { Component } from '@angular/core';
import type { EChartsOption } from 'echarts';
import { BaseComponentComponent } from '../base-component/base-component.component';
import { monthlySalesData } from '../../../../data/sample-data';

@Component({
  selector: 'app-area-chart',
  standalone: true,
  imports: [],
  templateUrl: '../base-component/base-component.component.html',
  styleUrl: './area-chart.component.css',
})
export class AreaChartComponent extends BaseComponentComponent {
  override height = '100%';
  override theme: string = 'default';

  protected override buildChartOptions(): EChartsOption {
    const months = monthlySalesData.map(d => d.month);
    const units = monthlySalesData.map(d => d.units);
    return {
      title: {
        text: 'Monthly Units Sold (Area)',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
      },
      xAxis: {
        type: 'category',
        data: months,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: 'Units Sold',
          type: 'line',
          areaStyle: {},
          data: units,
        }
      ]
    };
  }
}
