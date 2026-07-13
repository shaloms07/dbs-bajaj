import { useMemo, useState } from 'react';
import { useBranding } from '../branding/useBranding';
import { useApiKeys } from '../hooks/useApiKeys';
import { apiBaseUrl } from '../services/apiClient';

// Mock Response Payloads
const SCORE_SUCCESS_MOCK = {
  dbs_stats: {
    vehicle_number: "UP32AB1234",
    score: 88,
    total_deductions: 12,
    risk_level: "LOW",
    premium_modifier_pct: -10,
    violation_counts: {
      total: 2,
      severe: 0,
      moderate: 1,
      low: 1
    },
    window_start: "2025-06-25",
    window_end: "2026-06-25",
    last_violation_datetime: "2026-03-12T14:30:00Z"
  },
  base_premium: 15000,
  adjusted_premium: 13500,
  violations: [
    {
      challan_number: "CH98765432",
      challan_datetime: "2026-03-12T14:30:00Z",
      fine_amount: 1000,
      severity: "MODERATE",
      challan_place: "Hazratganj, Lucknow",
      offense_details: "Speed limit violation",
      thz_category_name: "Over-speeding",
      thz_category_description: "Exceeding posted speed limits",
      thz_category_deduction: 8,
      thz_deduction: 8,
      challan_status: "PAID"
    }
  ]
};

const VEHICLE_SUCCESS_MOCK = {
  vehicle_number: "DL8CAF5031",
  category: "L4",
  category_description: "Motorcycle / Two-wheeler",
  maker_description: "HERO MOTOCORP LTD",
  maker_model: "SPLENDOR PLUS",
  body_type: "SOLO WITH PILLION",
  fuel_type: "PETROL",
  color: "BLACK WITH PURPLE STRIPES",
  manufacturing_date: "2020-04-15",
  cubic_capacity: 97.2,
  owner_name: "R***SH K***AR",
  rto_code: "DL-8C"
};

const UNAUTHORIZED_MOCK = {
  detail: "Authentication required."
};

const VALIDATION_ERROR_MOCK = {
  detail: "Missing vehicle number."
};

const RATE_LIMIT_MOCK = {
  detail: "Rate limit exceeded: 60 per 1 minute"
};

const SERVER_ERROR_MOCK = {
  detail: "Internal Server Error"
};

export default function APIDocs() {
  const branding = useBranding();
  const { data: apiKeys = [] } = useApiKeys();

  const [activeSection, setActiveSection] = useState<'endpoint-score' | 'endpoint-vehicles'>('endpoint-score');
  const [selectedLanguage, setSelectedLanguage] = useState<'curl' | 'python' | 'nodejs' | 'java' | 'go'>('curl');
  const [selectedStatus, setSelectedStatus] = useState<'200' | '401' | '422' | '429' | '500'>('200');

  const [snippetCopied, setSnippetCopied] = useState(false);
  const [payloadCopied, setPayloadCopied] = useState(false);

  const firstActiveKey = useMemo(() => apiKeys.find((key) => key.is_active), [apiKeys]);
  const apiKeyToDisplay = useMemo(() => {
    return firstActiveKey ? `${firstActiveKey.key_prefix}••••••••••••` : 'YOUR_API_KEY';
  }, [firstActiveKey]);

  const handleCopySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setSnippetCopied(true);
    window.setTimeout(() => setSnippetCopied(false), 2000);
  };

  const handleCopyPayload = (text: string) => {
    navigator.clipboard.writeText(text);
    setPayloadCopied(true);
    window.setTimeout(() => setPayloadCopied(false), 2000);
  };

  // Generate dynamic snippet codes
  const scoreSnippetCode = useMemo(() => {
    const url = `${apiBaseUrl}/api/v1/score/UP32AB1234`;
    if (selectedLanguage === 'curl') {
      return `curl -X GET "${url}" \\\n  -H "x-api-key: ${apiKeyToDisplay}"`;
    }
    if (selectedLanguage === 'python') {
      return `import requests\n\nurl = "${url}"\nheaders = {\n    "x-api-key": "${apiKeyToDisplay}"\n}\n\nresponse = requests.get(url, headers=headers)\nprint(response.json())`;
    }
    if (selectedLanguage === 'nodejs') {
      return `fetch("${url}", {\n  method: "GET",\n  headers: {\n    "x-api-key": "${apiKeyToDisplay}"\n  }\n})\n.then(response => response.json())\n.then(data => console.log(data))\n.catch(error => console.error("Error:", error));`;
    }
    if (selectedLanguage === 'java') {
      return `import java.net.URI;\nimport java.net.http.HttpClient;\nimport java.net.http.HttpRequest;\nimport java.net.http.HttpResponse;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        HttpClient client = HttpClient.newHttpClient();\n        HttpRequest request = HttpRequest.newBuilder()\n            .uri(URI.create("${url}"))\n            .header("x-api-key", "${apiKeyToDisplay}")\n            .GET()\n            .build();\n\n        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());\n        System.out.println(response.body());\n    }\n}`;
    }
    if (selectedLanguage === 'go') {
      return `package main\n\nimport (\n    "fmt"\n    "io"\n    "net/http"\n)\n\nfunc main() {\n    req, _ := http.NewRequest("GET", "${url}", nil)\n    req.Header.Set("x-api-key", "${apiKeyToDisplay}")\n\n    res, _ := http.DefaultClient.Do(req)\n    defer res.Body.Close()\n    body, _ := io.ReadAll(res.Body)\n\n    fmt.Println(string(body))\n}`;
    }
    return '';
  }, [selectedLanguage, apiKeyToDisplay]);

  const vehicleSnippetCode = useMemo(() => {
    const url = `${apiBaseUrl}/api/v1/vehicles/DL8CAF5031`;
    if (selectedLanguage === 'curl') {
      return `curl -X GET "${url}" \\\n  -H "x-api-key: ${apiKeyToDisplay}"`;
    }
    if (selectedLanguage === 'python') {
      return `import requests\n\nurl = "${url}"\nheaders = {\n    "x-api-key": "${apiKeyToDisplay}"\n}\n\nresponse = requests.get(url, headers=headers)\nprint(response.json())`;
    }
    if (selectedLanguage === 'nodejs') {
      return `fetch("${url}", {\n  method: "GET",\n  headers: {\n    "x-api-key": "${apiKeyToDisplay}"\n  }\n})\n.then(response => response.json())\n.then(data => console.log(data))\n.catch(error => console.error("Error:", error));`;
    }
    if (selectedLanguage === 'java') {
      return `import java.net.URI;\nimport java.net.http.HttpClient;\nimport java.net.http.HttpRequest;\nimport java.net.http.HttpResponse;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        HttpClient client = HttpClient.newHttpClient();\n        HttpRequest request = HttpRequest.newBuilder()\n            .uri(URI.create("${url}"))\n            .header("x-api-key", "${apiKeyToDisplay}")\n            .GET()\n            .build();\n\n        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());\n        System.out.println(response.body());\n    }\n}`;
    }
    if (selectedLanguage === 'go') {
      return `package main\n\nimport (\n    "fmt"\n    "io"\n    "net/http"\n)\n\nfunc main() {\n    req, _ := http.NewRequest("GET", "${url}", nil)\n    req.Header.Set("x-api-key", "${apiKeyToDisplay}")\n\n    res, _ := http.DefaultClient.Do(req)\n    defer res.Body.Close()\n    body, _ := io.ReadAll(res.Body)\n\n    fmt.Println(string(body))\n}`;
    }
    return '';
  }, [selectedLanguage, apiKeyToDisplay]);

  // JSON string payloads
  const scoreResponsePayload = useMemo(() => {
    if (selectedStatus === '200') return JSON.stringify(SCORE_SUCCESS_MOCK, null, 2);
    if (selectedStatus === '401') return JSON.stringify(UNAUTHORIZED_MOCK, null, 2);
    if (selectedStatus === '422') return JSON.stringify(VALIDATION_ERROR_MOCK, null, 2);
    if (selectedStatus === '429') return JSON.stringify(RATE_LIMIT_MOCK, null, 2);
    if (selectedStatus === '500') return JSON.stringify(SERVER_ERROR_MOCK, null, 2);
    return '';
  }, [selectedStatus]);

  const vehicleResponsePayload = useMemo(() => {
    if (selectedStatus === '200') return JSON.stringify(VEHICLE_SUCCESS_MOCK, null, 2);
    if (selectedStatus === '401') return JSON.stringify(UNAUTHORIZED_MOCK, null, 2);
    if (selectedStatus === '422') return JSON.stringify(VALIDATION_ERROR_MOCK, null, 2);
    if (selectedStatus === '429') return JSON.stringify(RATE_LIMIT_MOCK, null, 2);
    if (selectedStatus === '500') return JSON.stringify(SERVER_ERROR_MOCK, null, 2);
    return '';
  }, [selectedStatus]);

  const renderEndpointReference = (type: 'score' | 'vehicles') => {
    const isScore = type === 'score';
    const title = isScore ? 'Get Score' : 'Get Vehicle';
    const path = isScore ? '/api/v1/score/{vehicle_number}' : '/api/v1/vehicles/{vehicle_number}';
    const desc = isScore
      ? `Fetches the vehicle risk parameters, computed ${branding.scoreLabel}, premium modification percentage, and details of all underlying traffic violations.`
      : `Fetches the RTO Registration Card (RC) details and physical specifications for the given vehicle number.`;

    const codeSnippetToDisplay = isScore ? scoreSnippetCode : vehicleSnippetCode;
    const responsePayloadToDisplay = isScore ? scoreResponsePayload : vehicleResponsePayload;

    return (
      <div className="api-endpoint-layout">
        {/* Left Side: Parameters and Schema Tables */}
        <div className="api-endpoint-details">
          <div className="api-endpoint-title-section">
            <h2>{title}</h2>
            <p style={{ margin: 0, color: 'var(--text2)', fontSize: '14.5px', lineHeight: 1.5 }}>{desc}</p>
          </div>

          <div className="api-endpoint-path-row">
            <span className="method-badge get">GET</span>
            <span>{apiBaseUrl}{path}</span>
          </div>

          {/* Path Params Section */}
          <div className="api-params-section">
            <h3>Path Parameters</h3>
            <table className="api-params-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="api-param-meta">
                      <span className="api-param-name">vehicle_number</span>
                      <span className="api-param-type">string</span>
                      <span className="api-param-badge required">required</span>
                    </div>
                  </td>
                  <td>
                    <div className="api-param-desc">
                      The vehicle registration license plate number (alphanumeric, uppercase, without spaces).
                    </div>
                    <div className="api-param-default">
                      Example: <code>{isScore ? 'UP32AB1234' : 'DL8CAF5031'}</code>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Headers Section */}
          <div className="api-params-section">
            <h3>Request Headers</h3>
            <table className="api-params-table">
              <thead>
                <tr>
                  <th>Header</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="api-param-meta">
                      <span className="api-param-name">x-api-key</span>
                      <span className="api-param-type">string</span>
                      <span className="api-param-badge required">required</span>
                    </div>
                  </td>
                  <td>
                    <div className="api-param-desc">
                      Your client authorization key. Pass this key in the headers of all REST calls.
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>



          {/* Response Status Codes Section */}
          <div className="api-params-section">
            <h3>Response Status Codes</h3>
            <table className="api-params-table">
              <thead>
                <tr>
                  <th>Status Code</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="api-param-meta">
                      <span className="api-param-name">200 OK</span>
                    </div>
                  </td>
                  <td>
                    <div className="api-param-desc">
                      Successful response. Returns the requested {isScore ? `${branding.scoreLabel} stats and violation details` : 'vehicle physical specification details'}.
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="api-param-meta">
                      <span className="api-param-name" style={{ color: 'var(--red)' }}>401 Unauthorized</span>
                    </div>
                  </td>
                  <td>
                    <div className="api-param-desc">
                      Authentication failure. The client authorization key (passed via <code>x-api-key</code>) is missing, inactive, or invalid.
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="api-param-meta">
                      <span className="api-param-name" style={{ color: '#fb923c' }}>422 Unprocessable Entity</span>
                    </div>
                  </td>
                  <td>
                    <div className="api-param-desc">
                      Validation error. The path parameters or headers failed syntax validation checks. For example, a malformed vehicle registration number format.
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="api-param-meta">
                      <span className="api-param-name" style={{ color: 'var(--red)' }}>429 Too Many Requests</span>
                    </div>
                  </td>
                  <td>
                    <div className="api-param-desc">
                      Rate limit exceeded. The rate limit threshold of <strong>60 requests per minute</strong> has been reached for this API key or IP address.
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="api-param-meta">
                      <span className="api-param-name" style={{ color: 'var(--red)' }}>500 Internal Server Error</span>
                    </div>
                  </td>
                  <td>
                    <div className="api-param-desc">
                      Unexpected server-side error. An exception occurred while processing the request on the server.
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>


        {/* Right Side: Code Snippets and Response Panel */}
        <div className="api-side-panels">
          {/* Snippet Block */}
          <div className="api-code-panel">
            <div className="api-code-panel-header">
              <span className="api-code-panel-title">Request Snippet</span>
              <div className="api-code-tabs">
                {(['curl', 'python', 'nodejs', 'java', 'go'] as const).map((lang) => (
                  <button
                    key={lang}
                    className={`api-code-tab ${selectedLanguage === lang ? 'active' : ''}`}
                    onClick={() => setSelectedLanguage(lang)}
                  >
                    {lang === 'nodejs' ? 'Node.js' : lang === 'curl' ? 'cURL' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>
              <button
                className="api-code-copy-btn"
                onClick={() => handleCopySnippet(codeSnippetToDisplay)}
              >
                <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9z" />
                </svg>
                {snippetCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="api-code-body">
              <code>{codeSnippetToDisplay}</code>
            </pre>
          </div>

          {/* Response Block */}
          <div className="api-response-panel">
            <div className="api-code-panel-header">
              <span className="api-code-panel-title">Response Schema</span>
              <div className="api-response-status-list">
                {(['200', '401', '422', '429', '500'] as const).map((status) => {
                  let label = '200 OK';
                  if (status === '401') label = '401 Unauthorized';
                  if (status === '422') label = '422 Unprocessable Entity';
                  if (status === '429') label = '429 Too Many Requests';
                  if (status === '500') label = '500 Internal Server Error';
                  return (
                    <button
                      key={status}
                      className={`status-tab status-${status} ${selectedStatus === status ? 'active' : ''}`}
                      onClick={() => setSelectedStatus(status)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <button
                className="api-code-copy-btn"
                onClick={() => handleCopyPayload(responsePayloadToDisplay)}
              >
                <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9z" />
                </svg>
                {payloadCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="api-json-block">
              <code>{responsePayloadToDisplay}</code>
            </pre>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="api-page">
      <section className="card api-hero-card" style={{ marginBottom: 0 }}>
        <p className="api-eyebrow">{branding.apiName} Documentation</p>
        <h1>REST API Reference Specs</h1>
        <p style={{ margin: '8px 0 0 0' }}>
          Explore endpoints, query formats, request header security, and response specifications to build your client integrations.
        </p>
      </section>

      <div className="api-console-layout">
        {/* Left Sub-Sidebar */}
        <aside className="api-sub-sidebar">
          <div className="api-sub-sidebar-group">
            <div className="api-sub-sidebar-title">API Endpoints</div>
            <div
              className={`api-sub-sidebar-item ${activeSection === 'endpoint-score' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('endpoint-score');
                setSelectedStatus('200');
              }}
              id="nav-section-score"
            >
              <span className="method-badge get">GET</span>
              Get Score
            </div>
            <div
              className={`api-sub-sidebar-item ${activeSection === 'endpoint-vehicles' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('endpoint-vehicles');
                setSelectedStatus('200');
              }}
              id="nav-section-vehicles"
            >
              <span className="method-badge get">GET</span>
              Get Vehicle
            </div>
          </div>
        </aside>

        {/* Right Details Pane */}
        <div className="api-console-content">
          {activeSection === 'endpoint-score' && renderEndpointReference('score')}
          {activeSection === 'endpoint-vehicles' && renderEndpointReference('vehicles')}
        </div>
      </div>
    </div>
  );
}
