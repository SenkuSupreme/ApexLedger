"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
  SortableContext as SortableContextProvider,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Settings,
  X,
  GripVertical,
  BarChart3,
  Activity,
  StickyNote,
  Calendar,
  TrendingUp,
  PieChart,
  Target,
  DollarSign,
  CheckSquare,
  LayoutGrid
} from "lucide-react";
import {
  MetricWidget,
  ActivityMapWidget,
  QuickNotesWidget,
  PerformanceInsightsWidget,
  WinRatioWidget,
  RecentTradesWidget,
  MonthlyPerformanceWidget,
  PsychologyWidget,
  SetupQualityWidget,
  RiskMetricsWidget,
  TradingStreakWidget,
  TimeAnalysisWidget,
  SymbolPerformanceWidget,
  GoalsProgressWidget,
  HabitsTrackerWidget,
  EquityCurveWidget,
  NewsWidget,
  WeatherWidget,
  ChecklistWidget,
  ComprehensiveMetricsWidget,
  AssetPerformanceWidget,
  DailyPnLComparisonWidget,
  StrategyPerformanceWidget,
} from "./widgets";

// Widget Types
export interface Widget {
  id: string;
  type: string;
  title: string;
  size: "small" | "medium" | "large" | "full";
  position: number;
  config?: any;
  isVisible: boolean;
}

// Available Widget Types
export const WIDGET_TYPES = {
  METRIC_CARD: "metric_card",
  CHART: "chart",
  QUICK_NOTES: "quick_notes",
  ACTIVITY_MAP: "activity_map",
  PERFORMANCE_INSIGHTS: "performance_insights",
  WIN_RATIO: "win_ratio",
  RECENT_TRADES: "recent_trades",
  MONTHLY_PERFORMANCE: "monthly_performance",
  PSYCHOLOGY: "psychology",
  SETUP_QUALITY: "setup_quality",
  RISK_METRICS: "risk_metrics",
  TRADING_STREAK: "trading_streak",
  TIME_ANALYSIS: "time_analysis",
  SYMBOL_PERFORMANCE: "symbol_performance",
  GOALS_PROGRESS: "goals_progress",
  HABITS_TRACKER: "habits_tracker",
  MARKET_SESSION: "market_session",
  EQUITY_CURVE: "equity_curve",
  NEWS: "news",
  WEATHER: "weather",
  CHECKLIST: "checklist",
  COMPREHENSIVE_METRICS: "comprehensive_metrics",
  ASSET_PERFORMANCE: "asset_performance",
  DAILY_PNL_COMPARISON: "daily_pnl_comparison",
  STRATEGY_PERFORMANCE: "strategy_performance",
} as const;

// Widget Size Classes
const WIDGET_SIZE_CLASSES = {
  small: "col-span-1 row-span-1",
  medium: "col-span-2 row-span-1",
  large: "col-span-2 row-span-2",
  full: "col-span-4 row-span-1",
};

// Sortable Widget Component
function SortableWidget({
  widget,
  children,
  onRemove,
  onResize,
  isEditMode,
}: {
  widget: Widget;
  children: React.ReactNode;
  onRemove: (id: string) => void;
  onResize: (id: string, size: Widget["size"]) => void;
  isEditMode: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: widget.id,
    transition: {
      duration: 200,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        ${WIDGET_SIZE_CLASSES[widget.size]}
        bg-card border border-border shadow-2xl rounded-[1.5rem] p-6
        relative group hover:border-border transition-all duration-300
        overflow-hidden
        ${isDragging ? "shadow-2xl shadow-background scale-[1.02] z-50 border-primary/50" : ""}
        ${isEditMode ? "ring-2 ring-primary/30" : ""}
      `}
    >
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />

      {/* Widget Controls */}
      {isEditMode && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="p-1 bg-foreground/10 hover:bg-foreground/20 rounded text-muted-foreground/60 hover:text-foreground transition-colors cursor-grab active:cursor-grabbing"
          >
            <GripVertical size={14} />
          </button>

          {/* Size Controls */}
          <select
            value={widget.size}
            onChange={(e) =>
              onResize(widget.id, e.target.value as Widget["size"])
            }
            className="text-xs bg-foreground/10 text-foreground border-none rounded px-1 py-1"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="small">S</option>
            <option value="medium">M</option>
            <option value="large">L</option>
            <option value="full">XL</option>
          </select>

          {/* Remove Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(widget.id);
            }}
            className="p-1 bg-red-500/20 hover:bg-red-500/40 rounded text-red-400 hover:text-red-300 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className={isDragging ? "pointer-events-none" : ""}>{children}</div>
    </div>
  );
}

// Widget System Component
export default function WidgetSystem({
  stats,
  loading,
  children,
}: {
  stats: any;
  loading: boolean;
  children?: React.ReactNode;
}) {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load widgets from localStorage on mount
  useEffect(() => {
    const savedWidgets = localStorage.getItem("dashboard-widgets");
    if (savedWidgets) {
      setWidgets(JSON.parse(savedWidgets));
    } else {
      // Default widgets
      setWidgets([
        {
          id: "recent-trades",
          type: WIDGET_TYPES.RECENT_TRADES,
          title: "Recent Trades",
          size: "medium",
          position: 0,
          isVisible: true,
        },
        {
          id: "performance-insights",
          type: WIDGET_TYPES.PERFORMANCE_INSIGHTS,
          title: "Performance Insights",
          size: "medium",
          position: 1,
          isVisible: true,
        },
        {
          id: "monthly-performance",
          type: WIDGET_TYPES.MONTHLY_PERFORMANCE,
          title: "Monthly Performance",
          size: "large",
          position: 2,
          isVisible: true,
        },
        {
          id: "risk-metrics",
          type: WIDGET_TYPES.RISK_METRICS,
          title: "Risk Metrics",
          size: "medium",
          position: 3,
          isVisible: true,
        },
        {
          id: "activity-map",
          type: WIDGET_TYPES.ACTIVITY_MAP,
          title: "Activity Map",
          size: "full",
          position: 4,
          isVisible: true,
        },
      ]);
    }
  }, []);

  // Save widgets to localStorage
  useEffect(() => {
    if (widgets.length > 0) {
      localStorage.setItem("dashboard-widgets", JSON.stringify(widgets));
    }
  }, [widgets]);

  // Handle drag end
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, index) => ({ ...item, position: index }));
      });
    }
  }

  // Add new widget
  const addWidget = (type: string, config?: any) => {
    let widgetConfig = config;

    // If adding a metric card without config, show a selection modal
    if (type === WIDGET_TYPES.METRIC_CARD && !config) {
      // Default to Total P&L for now, but could be enhanced with a metric selector
      widgetConfig = { metric: "totalPnl", icon: "DollarSign" };
    }

    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      title: getWidgetTitle(type),
      size: getDefaultSize(type),
      position: widgets.length,
      isVisible: true,
      config: widgetConfig,
    };
    setWidgets([...widgets, newWidget]);
    setShowAddWidget(false);
  };

  // Remove widget
  const removeWidget = (id: string) => {
    setWidgets(widgets.filter((w) => w.id !== id));
  };

  // Resize widget
  const resizeWidget = (id: string, size: Widget["size"]) => {
    setWidgets(widgets.map((w) => (w.id === id ? { ...w, size } : w)));
  };

  return (
    <div className="space-y-6">
      {/* Widget Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Dashboard Widgets</h2>
          <p className="text-sm text-muted-foreground/60">
            Customize your trading overview
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowAddWidget(true)}
            className="flex items-center gap-2 px-4 py-2 bg-foreground/10 hover:bg-foreground/20 rounded-lg text-foreground transition-colors"
          >
            <Plus size={16} />
            Add Widget
          </button>

          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isEditMode
                ? "bg-primary text-primary-foreground"
                : "bg-foreground/10 hover:bg-foreground/20 text-foreground"
            }`}
          >
            <Settings size={16} />
            {isEditMode ? "Done" : "Edit"}
          </button>
        </div>
      </div>

      {/* Widget Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={widgets.map((w) => w.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-4 gap-4 auto-rows-min">
            {widgets
              .filter((w) => w.isVisible)
              .sort((a, b) => a.position - b.position)
              .map((widget) => (
                <SortableWidget
                  key={widget.id}
                  widget={widget}
                  onRemove={removeWidget}
                  onResize={resizeWidget}
                  isEditMode={isEditMode}
                >
                  <WidgetContent
                    widget={widget}
                    stats={stats}
                    loading={loading}
                  />
                </SortableWidget>
              ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Widget Modal */}
      {showAddWidget && (
        <AddWidgetModal
          onAdd={addWidget}
          onClose={() => setShowAddWidget(false)}
        />
      )}

      {/* Additional content */}
      {children}
    </div>
  );
}

// Widget Content Renderer
function WidgetContent({
  widget,
  stats,
  loading,
}: {
  widget: Widget;
  stats: any;
  loading: boolean;
}) {
  const opacity = loading ? "opacity-50" : "opacity-100";

  switch (widget.type) {
    case WIDGET_TYPES.METRIC_CARD:
      return <MetricWidget widget={widget} stats={stats} className={opacity} />;
    case WIDGET_TYPES.ACTIVITY_MAP:
      return <ActivityMapWidget stats={stats} className={opacity} />;
    case WIDGET_TYPES.QUICK_NOTES:
      return <QuickNotesWidget className={opacity} />;
    case WIDGET_TYPES.PERFORMANCE_INSIGHTS:
      return <PerformanceInsightsWidget stats={stats} className={opacity} />;
    case WIDGET_TYPES.WIN_RATIO:
      return <WinRatioWidget stats={stats} className={opacity} />;
    case WIDGET_TYPES.RECENT_TRADES:
      return <RecentTradesWidget stats={stats} className={opacity} />;
    case WIDGET_TYPES.MONTHLY_PERFORMANCE:
      return <MonthlyPerformanceWidget stats={stats} className={opacity} />;
    case WIDGET_TYPES.PSYCHOLOGY:
      return <PsychologyWidget stats={stats} className={opacity} />;
    case WIDGET_TYPES.SETUP_QUALITY:
      return <SetupQualityWidget stats={stats} className={opacity} />;
    case WIDGET_TYPES.RISK_METRICS:
      return <RiskMetricsWidget stats={stats} className={opacity} />;
    case WIDGET_TYPES.TRADING_STREAK:
      return <TradingStreakWidget stats={stats} className={opacity} />;
    case WIDGET_TYPES.TIME_ANALYSIS:
      return <TimeAnalysisWidget stats={stats} className={opacity} />;
    case WIDGET_TYPES.SYMBOL_PERFORMANCE:
      return <SymbolPerformanceWidget stats={stats} className={opacity} />;
    case WIDGET_TYPES.GOALS_PROGRESS:
      return <GoalsProgressWidget className={opacity} />;
    case WIDGET_TYPES.HABITS_TRACKER:
      return <HabitsTrackerWidget className={opacity} />;
    case WIDGET_TYPES.EQUITY_CURVE:
      return <EquityCurveWidget stats={stats} className={opacity} />;
    case WIDGET_TYPES.NEWS:
      return <NewsWidget className={opacity} />;
    case WIDGET_TYPES.WEATHER:
      return <WeatherWidget className={opacity} />;
    case WIDGET_TYPES.CHECKLIST:
      return <ChecklistWidget className={opacity} />;
    case WIDGET_TYPES.COMPREHENSIVE_METRICS:
      return <ComprehensiveMetricsWidget stats={stats} className={opacity} />;
    case WIDGET_TYPES.STRATEGY_PERFORMANCE:
      return <StrategyPerformanceWidget stats={stats} className={opacity} />;
    default:
      return (
        <div className="flex items-center justify-center h-32 text-muted-foreground/40">
          Widget type not found
        </div>
      );
  }
}

// Helper functions
function getWidgetTitle(type: string): string {
  const titles = {
    [WIDGET_TYPES.METRIC_CARD]: "Metric Card",
    [WIDGET_TYPES.CHART]: "Chart",
    [WIDGET_TYPES.QUICK_NOTES]: "Quick Notes",
    [WIDGET_TYPES.ACTIVITY_MAP]: "Activity Map",
    [WIDGET_TYPES.PERFORMANCE_INSIGHTS]: "Performance Insights",
    [WIDGET_TYPES.WIN_RATIO]: "Win Ratio",
    [WIDGET_TYPES.RECENT_TRADES]: "Recent Trades",
    [WIDGET_TYPES.MONTHLY_PERFORMANCE]: "Monthly Performance",
    [WIDGET_TYPES.PSYCHOLOGY]: "Psychology Analysis",
    [WIDGET_TYPES.SETUP_QUALITY]: "Setup Quality",
    [WIDGET_TYPES.RISK_METRICS]: "Risk Metrics",
    [WIDGET_TYPES.TRADING_STREAK]: "Trading Streaks",
    [WIDGET_TYPES.TIME_ANALYSIS]: "Time Analysis",
    [WIDGET_TYPES.SYMBOL_PERFORMANCE]: "Symbol Performance",
    [WIDGET_TYPES.GOALS_PROGRESS]: "Goals Progress",
    [WIDGET_TYPES.HABITS_TRACKER]: "Habits Tracker",
    [WIDGET_TYPES.EQUITY_CURVE]: "Equity Curve",
    [WIDGET_TYPES.NEWS]: "Market News",
    [WIDGET_TYPES.WEATHER]: "Weather",
    [WIDGET_TYPES.CHECKLIST]: "Pre-Trade Checklist",
    [WIDGET_TYPES.COMPREHENSIVE_METRICS]: "Comprehensive Metrics",
    [WIDGET_TYPES.DAILY_PNL_COMPARISON]: "Daily P&L Comparison",
    [WIDGET_TYPES.STRATEGY_PERFORMANCE]: "Strategy Performance",
  };
  return titles[type as keyof typeof titles] || "Unknown Widget";
}

function getDefaultSize(type: string): Widget["size"] {
  const sizes = {
    [WIDGET_TYPES.METRIC_CARD]: "small" as const,
    [WIDGET_TYPES.CHART]: "medium" as const,
    [WIDGET_TYPES.QUICK_NOTES]: "medium" as const,
    [WIDGET_TYPES.ACTIVITY_MAP]: "full" as const,
    [WIDGET_TYPES.PERFORMANCE_INSIGHTS]: "medium" as const,
    [WIDGET_TYPES.WIN_RATIO]: "small" as const,
    [WIDGET_TYPES.RECENT_TRADES]: "medium" as const,
    [WIDGET_TYPES.MONTHLY_PERFORMANCE]: "large" as const,
    [WIDGET_TYPES.PSYCHOLOGY]: "medium" as const,
    [WIDGET_TYPES.SETUP_QUALITY]: "medium" as const,
    [WIDGET_TYPES.RISK_METRICS]: "medium" as const,
    [WIDGET_TYPES.TRADING_STREAK]: "medium" as const,
    [WIDGET_TYPES.TIME_ANALYSIS]: "large" as const,
    [WIDGET_TYPES.SYMBOL_PERFORMANCE]: "medium" as const,
    [WIDGET_TYPES.GOALS_PROGRESS]: "medium" as const,
    [WIDGET_TYPES.HABITS_TRACKER]: "medium" as const,
    [WIDGET_TYPES.EQUITY_CURVE]: "full" as const,
    [WIDGET_TYPES.NEWS]: "medium" as const,
    [WIDGET_TYPES.WEATHER]: "small" as const,
    [WIDGET_TYPES.CHECKLIST]: "medium" as const,
    [WIDGET_TYPES.COMPREHENSIVE_METRICS]: "large" as const,
    [WIDGET_TYPES.DAILY_PNL_COMPARISON]: "medium" as const,
    [WIDGET_TYPES.STRATEGY_PERFORMANCE]: "medium" as const,
  };
  return sizes[type as keyof typeof sizes] || "medium";
}

// Add Widget Modal Component
function AddWidgetModal({
  onAdd,
  onClose,
}: {
  onAdd: (type: string, config?: any) => void;
  onClose: () => void;
}) {
  const widgetOptions = [
    {
      id: "metric-total-pnl",
      type: WIDGET_TYPES.METRIC_CARD,
      title: "Total P&L",
      description: "Display total profit/loss",
      icon: <DollarSign size={24} />,
      category: "Analytics",
      config: { metric: "totalPnl", icon: "DollarSign" },
    },
    {
      id: "metric-win-rate",
      type: WIDGET_TYPES.METRIC_CARD,
      title: "Win Rate",
      description: "Display win percentage",
      icon: <Target size={24} />,
      category: "Analytics",
      config: { metric: "winRate", icon: "Target" },
    },
    {
      id: "metric-profit-factor",
      type: WIDGET_TYPES.METRIC_CARD,
      title: "Profit Factor",
      description: "Display profit factor ratio",
      icon: <Activity size={24} />,
      category: "Analytics",
      config: { metric: "profitFactor", icon: "Activity" },
    },
    {
      id: "metric-expectancy",
      type: WIDGET_TYPES.METRIC_CARD,
      title: "Expectancy",
      description: "Display expected value per trade",
      icon: <TrendingUp size={24} />,
      category: "Analytics",
      config: { metric: "expectancy", icon: "TrendingUp" },
    },
    {
      id: "metric-max-drawdown",
      type: WIDGET_TYPES.METRIC_CARD,
      title: "Max Drawdown",
      description: "Display maximum drawdown",
      icon: <TrendingUp size={24} />,
      category: "Risk",
      config: { metric: "maxDrawdown", icon: "TrendingDown" },
    },
    {
      id: "metric-total-trades",
      type: WIDGET_TYPES.METRIC_CARD,
      title: "Total Trades",
      description: "Display total number of trades",
      icon: <BarChart3 size={24} />,
      category: "Analytics",
      config: { metric: "totalTrades", icon: "BarChart2" },
    },
    {
      id: "metric-account-balance",
      type: WIDGET_TYPES.METRIC_CARD,
      title: "Account Balance",
      description: "Current portfolio equity",
      icon: <DollarSign size={24} />,
      category: "Analytics",
      config: { metric: "accountBalance", icon: "DollarSign" },
    },
    {
      id: "equity-curve",
      type: WIDGET_TYPES.EQUITY_CURVE,
      title: "Equity Curve",
      description: "Account growth visualization",
      icon: <TrendingUp size={24} />,
      category: "Analytics",
    },
    {
      id: "activity-map",
      type: WIDGET_TYPES.ACTIVITY_MAP,
      title: "Activity Map",
      description: "Trading activity heatmap",
      icon: <Calendar size={24} />,
      category: "Analytics",
    },
    {
      id: "performance-insights",
      type: WIDGET_TYPES.PERFORMANCE_INSIGHTS,
      title: "Performance Insights",
      description: "Best/worst trading days",
      icon: <TrendingUp size={24} />,
      category: "Analytics",
    },
    {
      id: "win-ratio",
      type: WIDGET_TYPES.WIN_RATIO,
      title: "Win Ratio Chart",
      description: "Win/loss ratio visualization",
      icon: <PieChart size={24} />,
      category: "Analytics",
    },
    {
      id: "recent-trades",
      type: WIDGET_TYPES.RECENT_TRADES,
      title: "Recent Trades",
      description: "Latest trading activity",
      icon: <Activity size={24} />,
      category: "Trading",
    },
    {
      id: "monthly-performance",
      type: WIDGET_TYPES.MONTHLY_PERFORMANCE,
      title: "Monthly Performance",
      description: "P&L by month",
      icon: <BarChart3 size={24} />,
      category: "Analytics",
    },
    {
      id: "psychology",
      type: WIDGET_TYPES.PSYCHOLOGY,
      title: "Psychology Analysis",
      description: "Emotional state tracking",
      icon: <Activity size={24} />,
      category: "Psychology",
    },
    {
      id: "setup-quality",
      type: WIDGET_TYPES.SETUP_QUALITY,
      title: "Setup Quality",
      description: "Grade performance analysis",
      icon: <Target size={24} />,
      category: "Analytics",
    },
    {
      id: "risk-metrics",
      type: WIDGET_TYPES.RISK_METRICS,
      title: "Risk Metrics",
      description: "Risk management stats",
      icon: <Activity size={24} />,
      category: "Risk",
    },
    {
      id: "trading-streak",
      type: WIDGET_TYPES.TRADING_STREAK,
      title: "Trading Streaks",
      description: "Win/loss streak tracking",
      icon: <TrendingUp size={24} />,
      category: "Psychology",
    },
    {
      id: "time-analysis",
      type: WIDGET_TYPES.TIME_ANALYSIS,
      title: "Time Analysis",
      description: "Performance by time",
      icon: <Calendar size={24} />,
      category: "Analytics",
    },
    {
      id: "symbol-performance",
      type: WIDGET_TYPES.SYMBOL_PERFORMANCE,
      title: "Symbol Performance",
      description: "Performance by currency pair",
      icon: <BarChart3 size={24} />,
      category: "Trading",
    },
    {
      id: "news",
      type: WIDGET_TYPES.NEWS,
      title: "Market News",
      description: "Latest market updates",
      icon: <Activity size={24} />,
      category: "Market",
    },
    {
      id: "quick-notes",
      type: WIDGET_TYPES.QUICK_NOTES,
      title: "Quick Notes",
      description: "Trading notes and insights",
      icon: <StickyNote size={24} />,
      category: "Productivity",
    },
    {
      id: "goals-progress",
      type: WIDGET_TYPES.GOALS_PROGRESS,
      title: "Goals Progress",
      description: "Trading goal tracking",
      icon: <Target size={24} />,
      category: "Productivity",
    },
    {
      id: "habits-tracker",
      type: WIDGET_TYPES.HABITS_TRACKER,
      title: "Habits Tracker",
      description: "Daily trading habits",
      icon: <Activity size={24} />,
      category: "Productivity",
    },
    {
      id: "weather",
      type: WIDGET_TYPES.WEATHER,
      title: "Weather",
      description: "Current weather info",
      icon: <Activity size={24} />,
      category: "Lifestyle",
    },
    {
      id: "comprehensive-metrics",
      type: WIDGET_TYPES.COMPREHENSIVE_METRICS,
      title: "Comprehensive Metrics",
      description: "All key performance metrics",
      icon: <BarChart3 size={24} />,
      category: "Analytics",
    },
    {
      id: "checklist",
      type: WIDGET_TYPES.CHECKLIST,
      title: "Pre-Trade Checklist",
      description: "Trading validation checklist",
      icon: <CheckSquare size={24} />,
      category: "Trading",
    },
  ];

  const filteredOptions = widgetOptions;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="text-xl font-bold text-foreground">Add Widget</h3>
            <p className="text-sm text-muted-foreground/60">
              Select a widget to add to your dashboard
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-foreground/10 rounded-lg text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOptions.map((widget) => (
              <button
                key={widget.id}
                onClick={() => onAdd(widget.type, widget.config)}
                className="flex flex-col items-start p-4 bg-foreground/5 hover:bg-foreground/10 border border-border hover:border-foreground/20 rounded-xl transition-all text-left group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    {widget.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">
                      {widget.title}
                    </h4>
                    <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">
                      {widget.category}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground/50 leading-relaxed">
                  {widget.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
