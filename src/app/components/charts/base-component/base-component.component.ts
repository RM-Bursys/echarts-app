import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  SimpleChanges,
  ViewChild,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import * as echarts from 'echarts';
import type { ECharts, EChartsOption, SetOptionOpts } from 'echarts';

export type ChartTheme = 'default' | 'dark' | string;

@Component({
  selector: 'app-base-component',
  standalone: true,
  imports: [],
  templateUrl: './base-component.component.html',
  styleUrl: './base-component.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseComponentComponent implements AfterViewInit, OnChanges, OnDestroy {

  // ── Common Inputs ──────────────────────────────────────────────

  /** ECharts option object. Triggers a full setOption when changed. */
  @Input() options: EChartsOption = {};

  /** Merge options incrementally instead of replacing the full config. */
  @Input() mergeOptions: EChartsOption | null = null;

  /** ECharts theme name or theme object. */
  @Input() theme: ChartTheme = 'default';

  /** Chart width. Defaults to 100% via CSS. */
  @Input() width: string = '100%';

  /** Chart height. Defaults to 400px. */
  @Input() height: string = '400px';

  /** Show ECharts built-in loading animation. */
  @Input() loading: boolean = false;

  /** Text shown inside the loading spinner. */
  @Input() loadingText: string = 'Loading…';

  /** Renderer: canvas (default) or svg. */
  @Input() renderer: 'canvas' | 'svg' = 'canvas';

  /** Whether to auto-resize the chart when the container resizes. */
  @Input() autoResize: boolean = true;

  // ── Outputs ────────────────────────────────────────────────────

  /** Emits the ECharts instance once it has been initialised. */
  @Output() chartInit = new EventEmitter<ECharts>();

  /** Emits ECharts click events. */
  @Output() chartClick = new EventEmitter<unknown>();

  /** Emits ECharts mouseover events. */
  @Output() chartMouseover = new EventEmitter<unknown>();

  // ── Internal refs ──────────────────────────────────────────────

  @ViewChild('chartContainer', { static: true })
  protected chartContainer!: ElementRef<HTMLDivElement>;

  protected chartInstance: ECharts | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {}

  // ── Lifecycle ──────────────────────────────────────────────────
  // All lifecycle hooks are marked overridable so child components
  // can extend behaviour. Always call super.*() in overrides.

  ngAfterViewInit(): void {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.chartInstance) return;

    if (changes['theme'] || changes['renderer']) {
      this.disposeChart();
      this.initChart();
      return;
    }

    if (changes['options']) {
      this.setOption(this.options);
    }

    if (changes['mergeOptions'] && this.mergeOptions) {
      this.setOption(this.mergeOptions, { notMerge: false });
    }

    if (changes['loading']) {
      this.toggleLoading();
    }
  }

  ngOnDestroy(): void {
    this.disposeChart();
  }

  // ── Public API ─────────────────────────────────────────────────

  /** Apply an ECharts option object. */
  setOption(option: EChartsOption, opts: SetOptionOpts = { notMerge: true }): void {
    this.chartInstance?.setOption(option, opts);
  }

  /** Trigger a manual resize (e.g. after a parent container changes size). */
  resize(): void {
    // Only call resize if chartInstance is valid and not disposed
    if (this.chartInstance && this.chartInstance.getDom() && this.chartInstance.getDom().offsetParent !== null) {
      this.chartInstance.resize();
    }
  }

  /** Returns the raw ECharts instance for advanced usage. */
  getInstance(): ECharts | null {
    return this.chartInstance;
  }

  // ── Protected hooks (override in children) ────────────────────

  /**
   * Override this in child components to supply the initial ECharts
   * option object. Called once during chart initialisation, before
   * setOption() is invoked. Return null to skip (use this.options directly).
   */
  protected buildChartOptions(): EChartsOption | null {
    return null;
  }

  /**
   * Override to bind additional ECharts events after the instance
   * is created. Always call super.bindEvents() first.
   */
  protected bindEvents(): void {
    this.chartInstance?.on('click', (params) => this.chartClick.emit(params));
    this.chartInstance?.on('mouseover', (params) => this.chartMouseover.emit(params));
  }

  /**
   * Override to customise loading indicator behaviour.
   * Always call super.toggleLoading() or replicate the logic.
   */
  protected toggleLoading(): void {
    if (!this.chartInstance) return;
    if (this.loading) {
      this.chartInstance.showLoading('default', { text: this.loadingText });
    } else {
      this.chartInstance.hideLoading();
    }
  }

  // ── Private helpers ────────────────────────────────────────────

  private initChart(): void {
    const el = this.chartContainer.nativeElement;
    const theme = this.theme === 'default' ? undefined : this.theme;

    this.chartInstance = echarts.init(el, theme, { renderer: this.renderer });

    // Prefer buildChartOptions() hook; fall back to @Input options
    const builtOptions = this.buildChartOptions();
    const resolvedOptions = builtOptions ?? this.options;

    if (resolvedOptions && Object.keys(resolvedOptions).length) {
      this.setOption(resolvedOptions);
    }

    this.toggleLoading();
    this.bindEvents();

    if (this.autoResize) {
      this.attachResizeObserver(el);
    }

    this.chartInit.emit(this.chartInstance);
  }

  private attachResizeObserver(el: HTMLElement): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.chartInstance?.resize();
    });
    this.resizeObserver.observe(el);
  }

  private disposeChart(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    if (this.chartInstance) {
      this.chartInstance.dispose();
      this.chartInstance = null;
    }
  }
}
