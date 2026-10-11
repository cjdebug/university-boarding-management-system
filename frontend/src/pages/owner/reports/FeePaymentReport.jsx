import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

import { apiRequest } from "../../../services/api";

const COLORS = {
  green: "#176b38",
  lightGreen: "#70b997",
  yellow: "#e9ae42",
  red: "#dc5656",
  blue: "#527ca8",
};

const STATUS_LABELS = {
  paid: "Paid",
  partially_paid: "Partially Paid",
  pending: "Pending",
  overdue: "Overdue",
};

const STATUS_COLORS = {
  paid: COLORS.green,
  partially_paid: COLORS.yellow,
  pending: COLORS.blue,
  overdue: COLORS.red,
};

const currency = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const compactCurrency = (value) => {
  const amount = Number(value || 0);

  if (Math.abs(amount) >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }

  if (Math.abs(amount) >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }

  return String(amount);
};

const initialFilters = {
  from_date: "",
  to_date: "",
  fee_status: "",
};

function FeePaymentReport() {
  const [report, setReport] = useState(null);

  const [filters, setFilters] = useState(initialFilters);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = async (selectedFilters = initialFilters) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (selectedFilters.from_date) {
        params.append("from_date", selectedFilters.from_date);
      }

      if (selectedFilters.to_date) {
        params.append("to_date", selectedFilters.to_date);
      }

      if (selectedFilters.fee_status) {
        params.append("fee_status", selectedFilters.fee_status);
      }

      const queryString = params.toString();

      const endpoint = queryString
        ? `/reports/fee-payments?${queryString}`
        : "/reports/fee-payments";

      const data = await apiRequest(endpoint);

      setReport(data);
    } catch (err) {
      setError(err.message || "Failed to load fee and payment report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(initialFilters);
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleGenerate = (event) => {
    event.preventDefault();

    if (
      filters.from_date &&
      filters.to_date &&
      filters.from_date > filters.to_date
    ) {
      setError("From Date cannot be after To Date.");
      return;
    }

    loadReport(filters);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    loadReport(initialFilters);
  };

  const handlePrint = () => {
    if (!loading && !error && report) {
      window.print();
    }
  };

  const summary = report?.summary || {};

  const charts = report?.charts || {};

  const collectionData = (charts.collection_performance || []).map((item) => ({
    name: item.name,
    value: Number(item.value || 0),
  }));

  const statusData = (charts.fee_status_distribution || []).map((item) => ({
    status: STATUS_LABELS[item.status] || item.status,
    key: item.status,
    count: Number(item.count || 0),
  }));

  const feeTypeData = (charts.outstanding_by_fee_type || []).map((item) => ({
    name: item.fee_type,
    outstanding: Number(item.outstanding || 0),
  }));

  const paymentTrendData = (charts.payment_trend || []).map((item) => ({
    month: item.month,
    amount: Number(item.amount || 0),
  }));

  const hasCollectionData = collectionData.some((item) => item.value > 0);

  const hasStatusData = statusData.some((item) => item.count > 0);

  const hasFeeTypeData = feeTypeData.some((item) => item.outstanding > 0);

  const hasPaymentTrendData = paymentTrendData.length > 0;

  const appliedFilters = report?.filters || {};

  const reportPeriod =
    appliedFilters.from_date || appliedFilters.to_date
      ? `${appliedFilters.from_date || "Beginning"} to ${
          appliedFilters.to_date || "Present"
        }`
      : "All Dates";

  const reportStatus = appliedFilters.fee_status
    ? STATUS_LABELS[appliedFilters.fee_status] || appliedFilters.fee_status
    : "All Statuses";

  const generatedDate = report?.generated_on
    ? String(report.generated_on)
    : "-";

  return (
    <div className="page-container report-page fee-analytics-page">
      <div className="page-header">
        <h1>Reports</h1>
        <p>
          Generate analytical reports for boarding fee and payment performance.
        </p>
      </div>

      {/* FILTER CONTROLS */}
      <form onSubmit={handleGenerate} className="fee-report-filter-panel">
        <h3>Filter Fee & Payment Report</h3>

        <p>
          Select a fee due-date range and payment status to generate a report.
        </p>

        <div className="fee-report-filter-grid">
          <div className="form-group">
            <label htmlFor="fee-from-date">From Date</label>

            <input
              id="fee-from-date"
              type="date"
              name="from_date"
              value={filters.from_date}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fee-to-date">To Date</label>

            <input
              id="fee-to-date"
              type="date"
              name="to_date"
              value={filters.to_date}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fee-status">Fee Status</label>

            <select
              id="fee-status"
              name="fee_status"
              value={filters.fee_status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div className="fee-report-actions">
          <button
            type="submit"
            className="generate-report-button"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={loading}
          >
            Reset Filters
          </button>
        </div>
      </form>

      {error && (
        <div className="report-error">
          {error}

          <button
            type="button"
            className="report-retry-button"
            onClick={() => loadReport(filters)}
          >
            Try Again
          </button>
        </div>
      )}

      {loading && (
        <div className="loading-text">Generating analytical report...</div>
      )}

      {!loading && !error && report && (
        <div className="report-section report-print-area fee-report-content">
          {/* PRINT HEADER */}
          <div className="print-report-header">
            <h1>Fee & Payment Analytical Report</h1>
            <p>Boarding Management System</p>
            <span>Generated on: {generatedDate}</span>
          </div>

          {/* WEB REPORT HEADER */}
          <div className="report-section-header">
            <div>
              <h2>Fee & Payment Analytical Report</h2>

              <p>
                Review financial performance, collection trends, and outstanding
                balances.
              </p>
            </div>

            <button
              type="button"
              className="generate-report-button"
              onClick={handlePrint}
            >
              Download PDF
            </button>
          </div>

          {/* APPLIED FILTERS */}
          <div className="fee-report-applied-filters">
            <div>
              <span>Fee Due Date Period</span>
              <strong>{reportPeriod}</strong>
            </div>

            <div>
              <span>Fee Status</span>
              <strong>{reportStatus}</strong>
            </div>

            <div>
              <span>Generated On</span>
              <strong>{generatedDate}</strong>
            </div>
          </div>

          {/* SUMMARY CARDS */}
          <div className="report-summary-grid fee-summary-grid">
            <div className="report-summary-card">
              <span>Total Fee Records</span>
              <strong>{summary.total_fee_records || 0}</strong>
            </div>

            <div className="report-summary-card">
              <span>Total Billed</span>
              <strong>{currency(summary.total_amount)}</strong>
            </div>

            <div className="report-summary-card">
              <span>Total Collected</span>
              <strong>{currency(summary.total_paid)}</strong>
            </div>

            <div className="report-summary-card">
              <span>Total Outstanding</span>
              <strong>{currency(summary.total_outstanding)}</strong>
            </div>

            <div className="report-summary-card">
              <span>Collection Rate</span>
              <strong>
                {Number(summary.collection_rate || 0).toFixed(2)}%
              </strong>
            </div>

            <div className="report-summary-card">
              <span>Overdue Amount</span>
              <strong>{currency(summary.overdue_amount)}</strong>
            </div>
          </div>

          {/* CHARTS */}
          <h3 className="fee-report-section-title">
            Financial Performance Analysis
          </h3>

          <div className="fee-report-chart-grid">
            {/* COLLECTION PERFORMANCE */}
            <div className="fee-report-chart-card">
              <h4>Collection Performance</h4>
              <p>Collected versus outstanding fees</p>

              {hasCollectionData ? (
                <div className="fee-report-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={collectionData}
                        cx="50%"
                        cy="45%"
                        innerRadius={55}
                        outerRadius={85}
                        dataKey="value"
                        nameKey="name"
                      >
                        {collectionData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={index === 0 ? COLORS.green : COLORS.yellow}
                          />
                        ))}
                      </Pie>

                      <Tooltip formatter={(value) => currency(value)} />

                      <Legend verticalAlign="bottom" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="fee-chart-empty">
                  No collection data available.
                </div>
              )}
            </div>

            {/* FEE STATUS DISTRIBUTION */}
            <div className="fee-report-chart-card">
              <h4>Fee Status Distribution</h4>
              <p>Number of fee records by current status</p>

              {hasStatusData ? (
                <div className="fee-report-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={statusData}
                      margin={{
                        top: 15,
                        right: 10,
                        left: 0,
                        bottom: 15,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />

                      <XAxis
                        dataKey="status"
                        tick={{ fontSize: 10 }}
                        interval={0}
                        height={45}
                      />

                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />

                      <Tooltip />

                      <Bar
                        dataKey="count"
                        name="Fee Records"
                        radius={[5, 5, 0, 0]}
                      >
                        {statusData.map((item) => (
                          <Cell
                            key={item.key}
                            fill={STATUS_COLORS[item.key] || COLORS.green}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="fee-chart-empty">
                  No fee status data available.
                </div>
              )}
            </div>

            {/* OUTSTANDING BY FEE TYPE */}
            <div className="fee-report-chart-card">
              <h4>Outstanding by Fee Type</h4>
              <p>Unpaid balances across fee categories</p>

              {hasFeeTypeData ? (
                <div className="fee-report-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={feeTypeData}
                      layout="vertical"
                      margin={{
                        top: 10,
                        right: 18,
                        bottom: 10,
                        left: 15,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />

                      <XAxis
                        type="number"
                        tickFormatter={compactCurrency}
                        tick={{ fontSize: 10 }}
                      />

                      <YAxis
                        type="category"
                        dataKey="name"
                        width={125}
                        tick={{ fontSize: 10 }}
                      />

                      <Tooltip formatter={(value) => currency(value)} />

                      <Bar
                        dataKey="outstanding"
                        name="Outstanding"
                        fill={COLORS.blue}
                        radius={[0, 5, 5, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="fee-chart-empty">
                  No outstanding balances to display.
                </div>
              )}
            </div>

            {/* PAYMENT TREND */}
            <div className="fee-report-chart-card">
              <h4>Monthly Payment Trend</h4>

              <p>Payments received against selected fee records</p>

              {hasPaymentTrendData ? (
                <div className="fee-report-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={paymentTrendData}
                      margin={{
                        top: 15,
                        right: 15,
                        left: 5,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />

                      <YAxis
                        tickFormatter={compactCurrency}
                        tick={{ fontSize: 10 }}
                        width={50}
                      />

                      <Tooltip formatter={(value) => currency(value)} />

                      <Line
                        type="monotone"
                        dataKey="amount"
                        name="Payments"
                        stroke={COLORS.green}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="fee-chart-empty">
                  No payments recorded for these fees.
                </div>
              )}
            </div>
          </div>

          {/* DESCRIPTIVE ANALYSIS */}
          <div className="fee-report-analysis">
            <h3>Descriptive Financial Analysis</h3>

            <p className="fee-analysis-intro">
              The following observations are calculated from the selected fee
              and payment records.
            </p>

            <ul>
              {(report.analysis || []).map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeePaymentReport;
