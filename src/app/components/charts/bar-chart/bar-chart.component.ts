import { Component } from '@angular/core';
import type { EChartsOption } from 'echarts';
import { BaseComponentComponent } from '../base-component/base-component.component';
import { monthlySalesData } from '../../../../data/sample-data';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [],
  templateUrl: '../base-component/base-component.component.html',
  styleUrl: './bar-chart.component.css',
})
export class BarChartComponent extends BaseComponentComponent {
  override height = '100%';
  override theme: string = 'default';

  protected override buildChartOptions(): EChartsOption {
    const months = monthlySalesData.map(d => d.month);
    const revenue = monthlySalesData.map(d => d.revenue);
    return {
      title: {
        text: 'Monthly Revenue (Bar)',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
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
          name: 'Revenue',
          type: 'bar',
          data: revenue,
        }
      ]
    };
  }
}
