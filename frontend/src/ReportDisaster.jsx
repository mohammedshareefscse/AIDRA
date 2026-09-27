import { useEffect, useState } from "react";
import "./ReportDisaster.css";

const API_URL = "http://127.0.0.1:8000";

function ReportDisaster({ user, onBack }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    disaster_type: "flood",
    severity: "medium",
    latitude: "",
    longitude: "",
    location_name: "",
    people_affected: 0,
  });

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [loadingIncidents, setLoadingIncidents] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    detectLocation();
    loadMyIncidents();
  }, []);

  function clearMessages() {
    setMessage("");
    setError("");
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function detectLocation() {
    clearMessages();

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((current) => ({
          ...current,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));

        setLocationLoading(false);
        setMessage("Your current location has been detected.");
      },
      (locationError) => {
        setLocationLoading(false);

        if (locationError.code === 1) {
          setError(
            "Location permission was denied. Please allow location access."
          );
        } else if (locationError.code === 2) {
          setError("Your location could not be determined.");
        } else {
          setError("Unable to detect your current location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  async function loadMyIncidents() {
    const token = localStorage.getItem("aidra_token");

    if (!token) {
      return;
    }

    setLoadingIncidents(true);

    try {
      const response = await fetch(`${API_URL}/incidents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setIncidents(Array.isArray(data) ? data : []);
    } catch {
      setError("Unable to load your disaster reports.");
    } finally {
      setLoadingIncidents(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    clearMessages();

    if (!form.latitude || !form.longitude) {
      setError("Please detect your current location before submitting.");
      return;
    }

    if (!form.title.trim()) {
      setError("Please enter a title for the disaster.");
      return;
    }

    if (!form.description.trim()) {
      setError("Please describe what happened.");
      return;
    }

    if (!form.location_name.trim()) {
      setError("Please enter the location name.");
      return;
    }

    const token = localStorage.getItem("aidra_token");

    if (!token) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/incidents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          disaster_type: form.disaster_type,
          severity: form.severity,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          location_name: form.location_name.trim(),
          people_affected: Number(form.people_affected),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to submit disaster report."
        );
      }

      setMessage(
        `Disaster report #${data.id} submitted successfully. Risk level: ${data.risk_level.toUpperCase()} (${data.risk_score}/100).`
      );

      setForm((current) => ({
        ...current,
        title: "",
        description: "",
        people_affected: 0,
      }));

      await loadMyIncidents();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  function getRiskClass(level) {
    if (level === "critical") {
      return "risk-critical";
    }

    if (level === "high") {
      return "risk-high";
    }

    if (level === "medium") {
      return "risk-medium";
    }

    return "risk-low";
  }

  function getStatusClass(status) {
    if (status === "resolved") {
      return "incident-resolved";
    }

    if (status === "investigating") {
      return "incident-investigating";
    }

    return "incident-reported";
  }

  return (
    <div className="report-page">
      <div className="report-header">
        <div>
          <p className="report-eyebrow">CITIZEN REPORTING</p>

          <h1>Report Disaster</h1>

          <p className="report-subtitle">
            Report floods, fires, earthquakes, cyclones and other
            emergencies to the AIDRA response system.
          </p>
        </div>

        <button
          className="report-back-button"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>
      </div>

      {message && (
        <div className="report-success">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="report-error">
          {error}
        </div>
      )}

      <div className="report-layout">
        <section className="report-card">
          <div className="card-heading">
            <div>
              <h2>Submit Disaster Report</h2>

              <p>
                Provide accurate information so responders can
                understand the situation.
              </p>
            </div>

            <span className="secure-badge">
              🔐 AUTHENTICATED
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>1. Disaster Information</h3>

              <div className="form-grid">
                <div className="form-field">
                  <label>Disaster Type</label>

                  <select
                    name="disaster_type"
                    value={form.disaster_type}
                    onChange={handleChange}
                  >
                    <option value="flood">Flood</option>
                    <option value="fire">Fire</option>
                    <option value="earthquake">
                      Earthquake
                    </option>
                    <option value="cyclone">Cyclone</option>
                    <option value="landslide">
                      Landslide
                    </option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Severity</label>

                  <select
                    name="severity"
                    value={form.severity}
                    onChange={handleChange}
                  >
                    <option value="low">
                      Low - Limited impact
                    </option>

                    <option value="medium">
                      Medium - Assistance needed
                    </option>

                    <option value="high">
                      High - Serious danger
                    </option>

                    <option value="critical">
                      Critical - Immediate danger
                    </option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Report Title</label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Example: Severe flooding near main road"
                  maxLength="200"
                  required
                />
              </div>

              <div className="form-field">
                <label>What happened?</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the disaster, danger, damage or assistance required..."
                  rows="6"
                  required
                />
              </div>

              <div className="form-field">
                <label>People Affected</label>

                <input
                  type="number"
                  name="people_affected"
                  value={form.people_affected}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-section">
              <h3>2. Disaster Location</h3>

              <div className="location-detected">
                <div>
                  <span className="location-status-dot"></span>

                  <strong>
                    {form.latitude && form.longitude
                      ? "Location detected"
                      : "Location required"}
                  </strong>
                </div>

                <button
                  type="button"
                  className="detect-location-button"
                  onClick={detectLocation}
                  disabled={locationLoading}
                >
                  {locationLoading
                    ? "Detecting..."
                    : "Detect Location"}
                </button>
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label>Latitude</label>

                  <input
                    type="text"
                    value={form.latitude}
                    readOnly
                    placeholder="Latitude"
                  />
                </div>

                <div className="form-field">
                  <label>Longitude</label>

                  <input
                    type="text"
                    value={form.longitude}
                    readOnly
                    placeholder="Longitude"
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Location Name</label>

                <input
                  type="text"
                  name="location_name"
                  value={form.location_name}
                  onChange={handleChange}
                  placeholder="Example: Whitefield Main Road, Bengaluru"
                  maxLength="255"
                  required
                />
              </div>
            </div>

            <div className="risk-information">
              <div className="risk-icon">AI</div>

              <div>
                <strong>Automatic Risk Assessment</strong>

                <p>
                  AIDRA will automatically calculate a risk
                  score using disaster type, severity and people
                  affected.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="submit-report-button"
              disabled={loading}
            >
              {loading
                ? "Submitting Report..."
                : "🚨 Submit Disaster Report"}
            </button>
          </form>

          <div className="report-notice">
            <strong>Important</strong>

            <p>
              AIDRA is an emergency coordination platform.
              For immediate life-threatening emergencies,
              contact your local emergency services.
            </p>
          </div>
        </section>

        <section className="report-card history-card">
          <div className="history-heading">
            <div>
              <h2>My Reports</h2>

              <p>
                Disaster reports submitted from your account.
              </p>
            </div>

            <button
              className="refresh-report-button"
              onClick={loadMyIncidents}
              disabled={loadingIncidents}
            >
              ↻ Refresh
            </button>
          </div>

          {loadingIncidents ? (
            <div className="history-empty">
              Loading reports...
            </div>
          ) : incidents.length === 0 ? (
            <div className="history-empty">
              <div className="empty-icon">✓</div>

              <h3>No disaster reports</h3>

              <p>
                You have not submitted a disaster report yet.
              </p>
            </div>
          ) : (
            <div className="incident-list">
              {incidents.map((incident) => (
                <div
                  className="incident-item"
                  key={incident.id}
                >
                  <div className="incident-top">
                    <div>
                      <span className="incident-number">
                        REPORT #{incident.id}
                      </span>

                      <h3>{incident.title}</h3>
                    </div>

                    <span
                      className={`risk-badge ${getRiskClass(
                        incident.risk_level
                      )}`}
                    >
                      {incident.risk_level}
                    </span>
                  </div>

                  <p className="incident-description">
                    {incident.description}
                  </p>

                  <div className="incident-details">
                    <span>
                      🌊 {incident.disaster_type}
                    </span>

                    <span>
                      📍 {incident.location_name}
                    </span>

                    <span>
                      👥 {incident.people_affected} affected
                    </span>
                  </div>

                  <div className="incident-bottom">
                    <span
                      className={`incident-status ${getStatusClass(
                        incident.status
                      )}`}
                    >
                      {incident.status}
                    </span>

                    <span className="risk-score">
                      Risk Score: {incident.risk_score}/100
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default ReportDisaster;