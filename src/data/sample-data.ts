export interface MonthlySales {
  month: string;
  revenue: number;
  units: number;
}

export const monthlySalesData: MonthlySales[] = [
  { month: 'Jan', revenue: 42000, units: 210 },
  { month: 'Feb', revenue: 38500, units: 185 },
  { month: 'Mar', revenue: 51000, units: 260 },
  { month: 'Apr', revenue: 47800, units: 240 },
  { month: 'May', revenue: 63200, units: 315 },
  { month: 'Jun', revenue: 58900, units: 295 },
  { month: 'Jul', revenue: 72400, units: 362 },
  { month: 'Aug', revenue: 69100, units: 348 },
  { month: 'Sep', revenue: 55700, units: 278 },
  { month: 'Oct', revenue: 61300, units: 307 },
  { month: 'Nov', revenue: 78500, units: 392 },
  { month: 'Dec', revenue: 84200, units: 421 },
];
