import { DashboardSection } from '../../../components/CommonBlocks';

const charts = ['Application Trends', 'Hiring Funnel', 'Match Quality Distribution', 'Time-to-Hire Metrics'];

export default function AnalyticsTab() {
  return (
    <DashboardSection title="Analytics & Insights">
      <div className="analytics-grid">
        {charts.map((chart) => (
          <div key={chart} className="chart-placeholder"><p>{chart}</p></div>
        ))}
      </div>
    </DashboardSection>
  );
}
