import { Component, Input, OnChanges, SimpleChanges, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { 
  ChartConfiguration, 
  ChartData, 
  ChartType, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler,
  LineController,
  BarController
} from 'chart.js';
import { TranslationService } from '../../../services/translation.service';
import { Chart } from 'chart.js';

export interface MetalsPriceData {
  date: string;
  gold_local: number;
  silver_local: number;
  platinum_local?: number;
}

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController
);

@Component({
  selector: 'app-metals-prices-chart',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
  ],
  templateUrl: './metals-prices-chart.component.html',
})
export class MetalsPricesChartComponent implements OnInit, OnChanges {
  @Input() data: MetalsPriceData[] = [];
  @Input() currency: string = 'AED';
  @Input() chartType: 'line' | 'bar' = 'line';
  @Input() height: number = 350;
  @Input() showLegend: boolean = true;

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public chartData: ChartData<'line' | 'bar'> = {
    labels: [],
    datasets: []
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'start',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            family: 'Outfit, sans-serif',
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          family: 'Outfit, sans-serif',
          size: 14,
        },
        bodyFont: {
          family: 'Outfit, sans-serif',
          size: 12,
        },
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            if (value !== null && value !== undefined) {
              return `${context.dataset.label}: ${value.toFixed(2)} ${this.currency}`;
            }
            return `${context.dataset.label}: 0.00 ${this.currency}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'category',
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Outfit, sans-serif',
            size: 11,
          },
        },
      },
      y: {
        type: 'linear',
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            family: 'Outfit, sans-serif',
            size: 11,
          },
          callback: (value) => {
            return Number(value).toFixed(2);
          },
        },
      },
    },
  };

  public chartTypeConfig: ChartType = 'line';

  constructor(public translationService: TranslationService) {}

  ngOnInit() {
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] || changes['chartType'] || changes['currency']) {
      this.updateChart();
    }
  }

  private updateChart() {
    if (!this.data || this.data.length === 0) {
      this.chartData = {
        labels: [],
        datasets: []
      };
      return;
    }

    // Sort data by date
    const sortedData = [...this.data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Extract dates for x-axis labels
    const labels = sortedData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString(
        this.translationService.currentLanguageValue === 'ar' ? 'ar-SA' : 'en-US',
        {
          month: 'short',
          day: 'numeric'
        }
      );
    });

    // Prepare datasets
    const goldData: number[] = [];
    const silverData: number[] = [];
    const platinumData: number[] = [];

    sortedData.forEach(item => {
      goldData.push(item.gold_local || 0);
      silverData.push(item.silver_local || 0);
      if (item.platinum_local !== undefined && item.platinum_local !== null) {
        platinumData.push(item.platinum_local);
      } else {
        platinumData.push(0);
      }
    });

    // Build datasets array
    const datasets: any[] = [
      {
        label: this.translationService.t('metals.gold'),
        data: goldData,
        borderColor: '#d8ac41',
        backgroundColor: 'rgba(216, 172, 65, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#d8ac41',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
      {
        label: this.translationService.t('metals.silver'),
        data: silverData,
        borderColor: '#667085',
        backgroundColor: 'rgba(102, 112, 133, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#667085',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
    ];

    // Add platinum if available
    const hasPlatinum = platinumData.some(val => val > 0);
    if (hasPlatinum) {
      datasets.push({
        label: this.translationService.t('metals.platinum'),
        data: platinumData,
        borderColor: '#0ba5ec',
        backgroundColor: 'rgba(11, 165, 236, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#0ba5ec',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      });
    }

    // Update chart type
    this.chartTypeConfig = this.chartType;

    // Update chart data
    this.chartData = {
      labels,
      datasets,
    };

    // Update RTL support and legend visibility
    const fontFamily = this.translationService.isRTL ? 'Cairo, sans-serif' : 'Outfit, sans-serif';
    const legendAlign = this.translationService.isRTL ? 'end' : 'start';

    this.chartOptions = {
      ...this.chartOptions,
      plugins: {
        ...this.chartOptions?.plugins,
        legend: {
          ...this.chartOptions?.plugins?.legend,
          display: this.showLegend,
          align: legendAlign,
          labels: {
            ...this.chartOptions?.plugins?.legend?.labels,
            font: {
              family: fontFamily,
              size: 12,
            },
          },
        },
        tooltip: {
          ...this.chartOptions?.plugins?.tooltip,
          titleFont: {
            family: fontFamily,
            size: 14,
          },
          bodyFont: {
            family: fontFamily,
            size: 12,
          },
        },
      },
      scales: {
        x: {
          type: 'category',
          grid: {
            display: false,
          },
          ticks: {
            font: {
              family: fontFamily,
              size: 11,
            },
          },
        },
        y: {
          type: 'linear',
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
          },
          ticks: {
            font: {
              family: fontFamily,
              size: 11,
            },
            callback: (value) => {
              return Number(value).toFixed(2);
            },
          },
        },
      },
    };

    // Force chart update
    if (this.chart) {
      this.chart.update();
    }
  }
}
