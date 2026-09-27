import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [page, setPage] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("aidra_token")
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Session expired");
        }

        return response.json();
      })
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        localStorage.removeItem("aidra_token");
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const handleLogin = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Invalid email or password");
    }

    localStorage.setItem("aidra_token", data.access_token);
    setToken(data.access_token);

    const meResponse = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
      },
    });

    const me = await meResponse.json();
    setUser(me);
  };

  const handleLogout = () => {
    localStorage.removeItem("aidra_token");
    setToken(null);
    setUser(null);
    setPage("dashboard");
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-card">
          <div className="brand-mark">A</div>
          <h2>AIDRA</h2>
          <p>Loading secure citizen portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">A</div>

          <div className="brand-text">
            <h1>AIDRA</h1>
            <p>Disaster & Emergency Management</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={page === "dashboard" ? "nav-item active" : "nav-item"}
            onClick={() => setPage("dashboard")}
          >
            🏠
            <span>Dashboard</span>
          </button>

          <button
            className={page === "sos" ? "nav-item active" : "nav-item"}
            onClick={() => setPage("sos")}
          >
            🚨
            <span>Emergency SOS</span>
          </button>

          <button className="nav-item disabled">
            ⚠️
            <span>Report Disaster</span>
          </button>

          <button className="nav-item disabled">
            ◇
            <span>Live Disaster Map</span>
          </button>

          <button className="nav-item disabled">
            ▤
            <span>My Incidents</span>
          </button>

          <button className="nav-item disabled">
            🔔
            <span>Alerts</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button className="logout-button" onClick={handleLogout}>
            ↪
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        {page === "dashboard" && (
          <Dashboard user={user} onOpenSOS={() => setPage("sos")} />
        )}

        {page === "sos" && (
          <SOSPage
            token={token}
            onBack={() => setPage("dashboard")}
          />
        )}
      </main>
    </div>
  );
}


function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-mark">A</div>
          <div>
            <h1>AIDRA</h1>
            <p>Disaster & Emergency Management</p>
          </div>
        </div>

        <div className="auth-heading">
          <span>SECURE ACCESS</span>
          <h2>Welcome back</h2>
          <p>
            Sign in to access your AIDRA emergency management portal.
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={submit}>
          <label>Email address</label>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />

          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
          />

          <button className="primary-button" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="auth-footer">
          🔐 JWT Authentication Active
        </div>
      </div>
    </div>
  );
}


function Dashboard({ user, onOpenSOS }) {
  return (
    <div className="page-container">
      <section className="welcome-card">
        <div>
          <span>SECURE CITIZEN PORTAL</span>

          <h2>
            Welcome, {user.full_name}
          </h2>

          <p>
            Your AIDRA account is authenticated and ready.
          </p>
        </div>

        <div className="account-active">
          ● Account Active
        </div>
      </section>

      <section className="account-grid">
        <div className="info-card">
          <span>ACCOUNT ROLE</span>
          <strong>{user.role}</strong>
        </div>

        <div className="info-card">
          <span>EMAIL</span>
          <strong>{user.email}</strong>
        </div>

        <div className="info-card">
          <span>PHONE</span>
          <strong>{user.phone || "Not provided"}</strong>
        </div>
      </section>

      <section className="feature-grid">
        <div className="feature-card sos-card">
          <div className="feature-icon">SOS</div>

          <h3>Emergency SOS</h3>

          <p>
            Send an emergency request with your current location
            to the AIDRA response system.
          </p>

          <button onClick={onOpenSOS} className="danger-button">
            Open Emergency SOS
          </button>
        </div>

        <div className="feature-card">
          <div className="feature-icon">⚠</div>

          <h3>Report Disaster</h3>

          <p>
            Report floods, fires, earthquakes, cyclones and
            other incidents.
          </p>

          <button className="secondary-button">
            Coming Next
          </button>
        </div>

        <div className="feature-card">
          <div className="feature-icon">◉</div>

          <h3>Live Disaster Map</h3>

          <p>
            View nearby incidents, risk levels and emergency
            information.
          </p>

          <button className="secondary-button">
            Coming Next
          </button>
        </div>
      </section>

      <div className="security-banner">
        ��
        <div>
          <strong>JWT Authentication Active</strong>
          <p>
            Your session is protected using token-based authentication.
          </p>
        </div>
      </div>
    </div>
  );
}


function SOSPage({ token, onBack }) {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [priority, setPriority] = useState("5");
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");

  const detectLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError("Location is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setStatusMessage(
          "Your current location has been detected."
        );
      },
      () => {
        setError(
          "Unable to detect your location. Please allow location access."
        );
      }
    );
  };

  const loadRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/sos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to load SOS requests.");
      }

      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadRequests();
    detectLocation();
  }, []);

  const submitSOS = async (event) => {
    event.preventDefault();

    setError("");
    setStatusMessage("");

    if (!latitude || !longitude) {
      setError("Please detect your current location first.");
      return;
    }

    if (!message.trim()) {
      setError("Please describe your emergency.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/sos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude: Number(latitude),
          longitude: Number(longitude),
          message: message.trim(),
          priority: Number(priority),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to submit emergency SOS."
        );
      }

      setStatusMessage(
        "Emergency SOS submitted successfully."
      );

      setMessage("");
      await loadRequests();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-container">
      <button className="back-button" onClick={onBack}>
        ← Back to Dashboard
      </button>

      <section className="sos-header">
        <div>
          <span>EMERGENCY RESPONSE</span>
          <h2>Emergency SOS</h2>
          <p>
            Send your emergency request and current location
            to the AIDRA response system.
          </p>
        </div>

        <div className="emergency-badge">
          🚨 EMERGENCY
        </div>
      </section>

      {statusMessage && (
        <div className="success-message">
          {statusMessage}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <section className="sos-grid">
        <div className="form-card">
          <h2>Send Emergency Request</h2>

          <p>
            Your location is required so responders can identify
            where help is needed.
          </p>

          <form onSubmit={submitSOS}>
            <label>Current Location</label>

            <div className="location-row">
              <input
                value={
                  latitude && longitude
                    ? `${latitude}, ${longitude}`
                    : ""
                }
                readOnly
                placeholder="Location not detected"
              />

              <button
                type="button"
                className="location-button"
                onClick={detectLocation}
              >
                Detect Location
              </button>
            </div>

            <label>Emergency Priority</label>

            <select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value)
              }
            >
              <option value="5">
                Critical - Immediate danger
              </option>

              <option value="4">
                High - Urgent assistance
              </option>

              <option value="3">
                Medium - Assistance needed
              </option>

              <option value="2">
                Low - Non urgent
              </option>

              <option value="1">
                Information
              </option>
            </select>

            <label>What happened?</label>

            <textarea
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              placeholder="Describe your emergency..."
              rows="7"
            />

            <button
              type="submit"
              className="danger-button full-width"
            >
              🚨 Send Emergency SOS
            </button>
          </form>
        </div>

        <div className="form-card">
          <div className="request-heading">
            <div>
              <h2>My SOS Requests</h2>
              <p>
                Track emergency requests submitted from your
                account.
              </p>
            </div>

            <button
              className="refresh-button"
              onClick={loadRequests}
            >
              Refresh
            </button>
          </div>

          {requests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✓</div>
              <h3>No SOS requests</h3>
              <p>
                You have not submitted an emergency request yet.
              </p>
            </div>
          ) : (
            <div className="request-list">
              {requests.map((request) => (
                <div
                  className="request-item"
                  key={request.id}
                >
                  <div>
                    <strong>SOS #{request.id}</strong>
                    <p>{request.message}</p>
                  </div>

                  <span className="status-badge">
                    {request.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}


export default App;
