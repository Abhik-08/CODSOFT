import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import { motion } from 'motion/react';
import { FiCpu, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';

interface InsightResponse {
  summary: string;
  recommendations: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  financialScore: number;
  mostActiveDay: string;
  largestTransaction: string;
  errorMessage?: string;
}

const FinancialInsightsCard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<InsightResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.get('/ai/insights');
      setData(res.data);
    } catch (err) {
      console.error('Error loading AI insights:', err);
      setError('Failed to load AI insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [user]);

  // Color matching helpers
  const getScoreColor = (score: number) => {
    if (score <= 40) return '#ef4444'; // Red
    if (score <= 70) return '#f97316'; // Orange
    return '#10b981'; // Green
  };

  const getRiskColor = (risk: 'Low' | 'Medium' | 'High') => {
    if (risk === 'High') return '#ef4444';
    if (risk === 'Medium') return '#f97316';
    return '#10b981';
  };

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -12 },
    show: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring' as const, stiffness: 260, damping: 20 },
    },
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div>
          <div className="skeleton-block" style={{ width: '40%' }} />
          <div className="skeleton-block" style={{ width: '90%' }} />
          <div className="skeleton-block" style={{ width: '80%' }} />
          <div className="skeleton-block" style={{ width: '60%' }} />
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchInsights} className="try-again-btn">
            Try Again
          </button>
        </div>
      );
    }

    if (!data) return null;

    return (
      <div>
        {data.errorMessage && (
          <div className="warning-banner">
            <FiAlertTriangle className="warning-icon" />
            <div>
              <strong>Analysis Warning:</strong> {data.errorMessage}
            </div>
          </div>
        )}

        <div className="insights-score-row">
          <div
            className="score-display"
            style={{ color: getScoreColor(data.financialScore) }}
          >
            {data.financialScore}
            <span className="score-max"> / 100</span>
          </div>
          <div
            className="risk-badge"
            style={{ color: getRiskColor(data.riskLevel) }}
          >
            Risk: {data.riskLevel}
          </div>
        </div>

        <p className="summary-text">{data.summary}</p>

        {data.recommendations && data.recommendations.length > 0 && (
          <div>
            <div className="rec-section-title">Key Recommendations</div>
            <motion.ul
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="rec-list"
            >
              {data.recommendations.map((rec) => (
                <motion.li
                  key={rec}
                  variants={itemVariants}
                  className="rec-item"
                >
                  <span className="rec-check">✓</span>
                  <span>{rec}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        )}

        <div className="chips-container">
          <div className="insight-chip">Most Active: {data.mostActiveDay}</div>
          <div className="insight-chip">{data.largestTransaction}</div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        .insights-card {
          background-color: var(--background-elevated);
          border: 2px solid var(--text-primary);
          box-shadow: 6px 6px 0px var(--text-primary);
          border-radius: 20px;
          padding: 24px;
          font-family: var(--font-sans);
          color: var(--text-primary);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
          overflow: hidden;
          margin-top: 12px;
        }

        html.dark .insights-card {
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 6px 6px 0px rgba(255, 255, 255, 0.1);
        }

        .insights-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-dark);
          padding-bottom: 16px;
          margin-bottom: 20px;
        }

        .insights-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-mono);
          font-weight: 850;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .refresh-btn {
          background: transparent;
          border: 1.5px solid var(--text-primary);
          color: var(--text-primary);
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        html.dark .refresh-btn {
          border-color: rgba(255, 255, 255, 0.2);
          color: var(--text-primary);
        }

        .refresh-btn:hover {
          background-color: var(--text-primary);
          color: var(--background-elevated);
        }

        html.dark .refresh-btn:hover {
          background-color: var(--text-primary);
          color: var(--background-deep);
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Loading Skeletons */
        .skeleton-block {
          height: 18px;
          border-radius: 6px;
          background-color: rgba(0, 0, 0, 0.05);
          margin-bottom: 12px;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        html.dark .skeleton-block {
          background-color: rgba(255, 255, 255, 0.06);
        }

        @keyframes skeleton-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        /* Error States */
        .error-container {
          padding: 24px 0;
          text-align: center;
        }

        .error-message {
          font-size: 13.5px;
          font-weight: 500;
          color: #ef4444;
          margin-bottom: 12px;
        }

        .try-again-btn {
          padding: 8px 16px;
          font-size: 11.5px;
          font-family: var(--font-mono);
          font-weight: 700;
          text-transform: uppercase;
          background-color: var(--background-deep);
          color: var(--text-primary);
          border: 1.5px solid var(--text-primary);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .try-again-btn:hover {
          background-color: var(--text-primary);
          color: var(--background-elevated);
        }

        /* Score & Badges */
        .insights-score-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 18px;
        }

        .score-display {
          font-family: var(--font-mono);
          font-size: 32px;
          font-weight: 900;
        }

        .score-max {
          font-size: 18px;
          font-weight: 500;
          opacity: 0.5;
        }

        .risk-badge {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 6px;
          border: 1.5px solid currentColor;
          letter-spacing: 0.05em;
        }

        /* Warning Banner */
        .warning-banner {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 16px;
          background-color: rgba(245, 158, 11, 0.1);
          border: 1.5px solid #f59e0b;
          border-radius: 10px;
          margin-bottom: 18px;
          color: #d97706;
          font-size: 12.5px;
          line-height: 1.4;
        }

        html.dark .warning-banner {
          color: #fbbf24;
          background-color: rgba(245, 158, 11, 0.05);
          border-color: rgba(245, 158, 11, 0.35);
        }

        .warning-icon {
          flex-shrink: 0;
          margin-top: 2px;
          font-size: 16px;
        }

        /* Summary Text */
        .summary-text {
          font-size: 13.5px;
          line-height: 1.6;
          margin-bottom: 20px;
          opacity: 0.85;
        }

        /* Recommendations */
        .rec-section-title {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          opacity: 0.5;
          margin-bottom: 10px;
        }

        .rec-list {
          list-style: none;
          padding: 0;
          margin: 0 0 24px 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .rec-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 13px;
          line-height: 1.5;
        }

        .rec-check {
          color: #10b981;
          font-weight: 900;
          font-size: 14px;
          line-height: 1;
        }

        /* Footer Chips */
        .chips-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          border-top: 1px solid var(--border-dark);
          padding-top: 16px;
        }

        .insight-chip {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          background-color: var(--recessed);
          border: 1px solid var(--border-dark);
          padding: 4px 10px;
          border-radius: 6px;
          opacity: 0.8;
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="insights-card"
      >
        <div className="insights-header">
          <div className="insights-title">
            <FiCpu className="text-[var(--accent)]" style={{ fontSize: '18px' }} />
            <span>AI Financial Insights</span>
          </div>
          <button
            onClick={fetchInsights}
            disabled={loading}
            className="refresh-btn"
            title="Reload analysis"
          >
            <FiRefreshCw className={loading ? 'spin-icon' : ''} />
          </button>
        </div>

        {renderContent()}
      </motion.div>
    </>
  );
};

export default FinancialInsightsCard;
