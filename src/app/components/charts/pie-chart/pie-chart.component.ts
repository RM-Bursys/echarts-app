import { Component } from '@angular/core';
import type { EChartsOption } from 'echarts';
import { BaseComponentComponent } from '../base-component/base-component.component';
import { monthlySalesData } from '../../../../data/sample-data';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [],
  templateUrl: '../base-component/base-component.component.html',
  styleUrl: './pie-chart.component.css',
})
export class PieChartComponent extends BaseComponentComponent {
  override height = '100%';
  override theme: string = 'default';

  protected override buildChartOptions(): EChartsOption {
    const data = monthlySalesData.map(d => ({
      name: d.month,
      value: d.revenue
    }));
    return {
      title: {
        text: 'Monthly Revenue Share',
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: <b>${c}</b> ({d}%)',
      },
      legend: {
        orient: 'horizontal',
        left: 'left',
      },
      series: [
        {
          name: 'Revenue',
          type: 'pie',
          radius: '60%',
          data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  }
}
