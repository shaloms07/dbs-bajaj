import { useEffect, useMemo, useRef, useState } from 'react';
import Papa, { ParseResult } from 'papaparse';
import { submitBatch, BatchLookupResponse, BatchLookupResult } from '../services/batchService';
import { ScoreBand } from '../types/score';
import { bandFromScore } from '../utils/bandFromScore';

type ParsedCsvRow = Record<string, string>;

const MAX_BATCH_SIZE = 50;

function normalizeVehicleNumber(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function formatVehicleNumber(value: string) {
  const normalized = normalizeVehicleNumber(value);
  const match = normalized.match(/^([A-Z]{2})(\d{1,2})([A-Z]{1,3})(\d{1,4})$/);
  if (!match) return normalized;
  return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
}

function formatRiskLabel(value: string) {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeRiskLevel(value: string, score: number): ScoreBand {
  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const allowed: ScoreBand[] = [
    'EXEMPLARY',
    'RESPONSIBLE',
    'AVERAGE',
    'MARGINAL',
    'AT_RISK',
    'HIGH_RISK',
    'SERIOUS_RISK',
    'CHRONIC_VIOLATOR',
    'HABITUAL_OFFENDER',
    'EXTREME_RISK'
  ];

  return allowed.includes(normalized as ScoreBand)
    ? (normalized as ScoreBand)
    : bandFromScore(score);
}

function formatBandLabel(value: ScoreBand) {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function bandClass(label: string) {
  return `recent-band band-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
}

function extractVehicleNumbers(rows: ParsedCsvRow[]) {
  return rows
    .map((row) => {
      const firstValue = Object.values(row)[0] || '';
      return (
        row.vehicle_number ||
        row.vehicle_numbers ||
        row.reg_no ||
        row.registration_number ||
        row.registration ||
        row.vehicleNumber ||
        firstValue
      );
    })
    .map((value) => normalizeVehicleNumber(value))
    .filter(Boolean)
    .slice(0, MAX_BATCH_SIZE);
}

export default function BatchProcessing() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusLabel, setStatusLabel] = useState('Awaiting upload');
  const [progressPercent, setProgressPercent] = useState(0);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [batchResponse, setBatchResponse] = useState<BatchLookupResponse | null>(null);
  const [selectedBandFilter, setSelectedBandFilter] = useState<ScoreBand | 'ALL'>('ALL');

  const results = batchResponse?.results ?? [];
  const totalResults = batchResponse?.total_results ?? 0;
  const riskCategoryCounts = batchResponse?.risk_category_counts ?? {};
  const normalizedResults = useMemo(
    () =>
      results.map((row) => ({
        ...row,
        normalizedBand: normalizeRiskLevel(row.risk_level, row.score)
      })),
    [results]
  );

  const availableBandOptions = useMemo(
    () =>
      Array.from(new Set(normalizedResults.map((row) => row.normalizedBand))).sort((a, b) =>
        formatBandLabel(a).localeCompare(formatBandLabel(b))
      ),
    [normalizedResults]
  );
  const filteredResults = useMemo(
    () =>
      selectedBandFilter === 'ALL'
        ? normalizedResults
        : normalizedResults.filter((row) => row.normalizedBand === selectedBandFilter),
    [normalizedResults, selectedBandFilter]
  );
  const extremeCaseCount = useMemo(
    () => normalizedResults.filter((row) => row.normalizedBand === 'EXTREME_RISK').length,
    [normalizedResults]
  );
  const activeFilterLabel = selectedBandFilter === 'ALL' ? 'All bands' : formatBandLabel(selectedBandFilter);

  const unresolvedCount = Math.max(submittedCount - totalResults, 0);

  useEffect(() => {
    if (!loading) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setProgressPercent((current) => {
        if (current >= 90) {
          return current;
        }

        if (current < 40) {
          return Math.min(current + 8, 90);
        }

        if (current < 70) {
          return Math.min(current + 4, 90);
        }

        return Math.min(current + 2, 90);
      });
    }, 450);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loading]);

  const onFileSelected = (files: FileList | null) => {
    if (!files?.length) return;

    const file = files[0];
    setFileName(file.name);
    setError('');
    setStatusLabel('Reading CSV');
    setProgressPercent(12);
    setSelectedBandFilter('ALL');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result: ParseResult<ParsedCsvRow>) => {
        const vehicleNumbers = extractVehicleNumbers(result.data);

        if (!vehicleNumbers.length) {
          setBatchResponse(null);
          setSubmittedCount(0);
          setStatusLabel('Awaiting upload');
          setProgressPercent(0);
          setError('No vehicle numbers found in the uploaded CSV.');
          return;
        }

        setLoading(true);
        setSubmittedCount(vehicleNumbers.length);
        setBatchResponse(null);
        setStatusLabel('Processing on DBS-Bajaj API');
        setProgressPercent(28);

        try {
          const response = await submitBatch(vehicleNumbers);
          setBatchResponse(response);
          setStatusLabel('Batch completed');
          setProgressPercent(100);
        } catch (err) {
          setStatusLabel('Batch failed');
          setProgressPercent(0);
          setError(err instanceof Error ? err.message : 'Batch lookup failed');
        } finally {
          setLoading(false);
        }
      },
      error: () => {
        setBatchResponse(null);
        setSubmittedCount(0);
        setStatusLabel('Batch failed');
        setProgressPercent(0);
        setError('Unable to parse the uploaded CSV.');
      }
    });
  };

  const downloadTemplate = () => {
    const csv = Papa.unparse([
      { vehicle_number: 'MH31AB1234' },
      { vehicle_number: 'UP32CD5678' },
      { vehicle_number: 'DL8CAF9012' }
    ]);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dbs_bajaj_batch_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportResults = () => {
    if (!filteredResults.length) return;

    const csv = Papa.unparse(
      filteredResults.map((row) => ({
        vehicle_number: row.vehicle_number,
        category: row.category,
        category_description: row.category_description,
        score: row.score,
        risk_level: row.normalizedBand,
        premium_modifier_pct: row.premium_modifier_pct,
        total_violations: row.total_violations
      }))
    );

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dbs_bajaj_batch_results.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const openVehicleLookup = (vehicleNumber: string) => {
    window.open(`/lookup?regNo=${encodeURIComponent(normalizeVehicleNumber(vehicleNumber))}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="batch-layout">
      <div>
        <div className="card">
          <div className="card-title">Upload Vehicle List</div>
          <button
            type="button"
            className="upload-zone"
            onClick={() => inputRef.current?.click()}
          >
            <div className="upload-icon">CSV</div>
            <div className="upload-text">Drop CSV file here or click to browse</div>
            <div className="upload-sub">Max 50 vehicle numbers per batch</div>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            onChange={(event) => onFileSelected(event.target.files)}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="sample-download-btn"
            onClick={downloadTemplate}
          >
            Download Sample CSV
          </button>

          <div className="batch-progress" style={{ marginTop: 14 }}>
            <div className="progress-label">
              <span>Processing: {fileName || 'No file selected'}</span>
              <span style={{ color: 'var(--accent2)' }}>{progressPercent}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text2)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{totalResults.toLocaleString('en-IN')} / {submittedCount.toLocaleString('en-IN')} returned</span>
              <span style={{ color: error ? 'var(--red)' : loading ? 'var(--accent2)' : 'var(--green)' }}>
                {statusLabel}
              </span>
            </div>
            {loading && (
              <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text3)' }}>
                This percentage reflects UI submission state only. Final completion is when results are returned.
              </div>
            )}
          </div>

          {error && (
            <div style={{ marginTop: 14, borderRadius: 10, border: '1px solid rgba(220,38,38,0.2)', background: 'rgba(254,226,226,0.7)', padding: 12, fontSize: 12, color: '#991b1b' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 14 }}>
            <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: 10, textAlign: 'center' }}>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 16, color: 'var(--green)' }}>{totalResults.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>Returned</div>
            </div>
            <div
              className={`batch-summary-card ${selectedBandFilter === 'EXTREME_RISK' ? 'active' : ''}`}
              onClick={() => setSelectedBandFilter('EXTREME_RISK')}
              title="Show only extreme-risk cases"
            >
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 16, color: 'var(--amber)' }}>{extremeCaseCount.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>Extreme Cases</div>
            </div>
            <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: 10, textAlign: 'center' }}>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 16, color: 'var(--text2)' }}>{unresolvedCount.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>Missing</div>
            </div>
          </div>
        </div>
      </div>

      <div className="batch-results-table">
        <div className="results-toolbar">
          <div className="results-count">Showing <strong>{filteredResults.length.toLocaleString('en-IN')}</strong> results</div>
          <div className="batch-filter-controls">
            <label className="batch-filter-label" htmlFor="batch-band-filter">Band</label>
            <select
              id="batch-band-filter"
              className="batch-filter-select"
              value={selectedBandFilter}
              onChange={(event) => setSelectedBandFilter(event.target.value as ScoreBand | 'ALL')}
            >
              <option value="ALL">All bands</option>
              {availableBandOptions.map((band) => (
                <option key={band} value={band}>
                  {formatBandLabel(band)}
                </option>
              ))}
            </select>
            {selectedBandFilter !== 'ALL' && (
              <button type="button" className="batch-filter-clear" onClick={() => setSelectedBandFilter('ALL')}>
                Remove Filter
              </button>
            )}
          </div>
          <button className="export-btn" onClick={exportResults} disabled={!filteredResults.length}>
            Export CSV
          </button>
        </div>
        {selectedBandFilter !== 'ALL' && (
          <div className="batch-filter-active">
            Active filter: <strong>{activeFilterLabel}</strong>
          </div>
        )}
        <table>
          <thead>
            <tr>
              <th>Registration No.</th>
              <th>Vehicle Type</th>
              <th>DBS-Bajaj Score</th>
              <th>Band</th>
              <th>Violations</th>
              <th>Premium Modifier (%)</th>
            </tr>
          </thead>
          <tbody>
            {!filteredResults.length && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 11, padding: '16px 20px' }}>
                  {results.length ? 'No records match the current band filter.' : 'Upload a CSV to submit batch vehicle lookup results.'}
                </td>
              </tr>
            )}
            {filteredResults.map((row) => {
              const riskLabel = formatBandLabel(row.normalizedBand);
              const modifierColor =
                row.premium_modifier_pct > 0 ? 'var(--red)' : row.premium_modifier_pct < 0 ? 'var(--green)' : 'var(--text2)';

              return (
                <tr
                  key={row.vehicle_number}
                  className="batch-result-row"
                  onClick={() => openVehicleLookup(row.vehicle_number)}
                  title="Open this vehicle in Vehicle Lookup"
                >
                  <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>
                    {formatVehicleNumber(row.vehicle_number)}
                  </td>
                  <td>{row.category_description || row.category || '-'}</td>
                  <td style={{ fontFamily: 'DM Mono, monospace', color: 'var(--text)' }}>{row.score}</td>
                  <td><span className={bandClass(riskLabel)}>{riskLabel}</span></td>
                  <td>{row.total_violations}</td>
                  <td style={{ fontFamily: 'DM Mono, monospace', color: modifierColor }}>
                    {row.premium_modifier_pct > 0 ? '+' : ''}{row.premium_modifier_pct}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
