import { useEffect, useMemo, useState } from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "@tensorflow/tfjs";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

type Health = {
  status: string;
  service: string;
  env: string;
  uptimeSec: number;
  host: { hostname: string; platform: string; arch: string };
  system: {
    load1: number;
    load5: number;
    load15: number;
    memFreeBytes: number;
    memTotalBytes: number;
  };
  timestamp: string;
};

type Device = {
  connected: boolean;
  lastFault?: { type: string; at: string };
};

export default function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [metrics, setMetrics] = useState("");
  const [loading, setLoading] = useState(false);

  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const [imgUrl, setImgUrl] = useState("");
  const [predictions, setPredictions] = useState<
    Array<{ className: string; probability: number }>
  >([]);

  const stationMetrics = useMemo(
    () => metrics.split("\n").filter((l) => l.startsWith("station_")).join("\n"),
    [metrics]
  );

  async function refreshAll() {
    setLoading(true);
    try {
      const [h, d, m] = await Promise.all([
        fetch(`${API_BASE}/health`).then((r) => r.json()),
        fetch(`${API_BASE}/device`).then((r) => r.json()),
        fetch(`${API_BASE}/metrics`).then((r) => r.text()),
      ]);
      setHealth(h);
      setDevice(d.device);
      setMetrics(m);
    } finally {
      setLoading(false);
    }
  }

  async function injectFault(type: string) {
    await fetch(`${API_BASE}/simulate/fault`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    await refreshAll();
  }

  useEffect(() => {
    refreshAll();
    const id = setInterval(refreshAll, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    mobilenet.load().then(setModel);
  }, []);

  async function runRecognition() {
    if (!model) return;
    const img = document.getElementById("preview-img") as HTMLImageElement | null;
    if (!img) return;
    const preds = await model.classify(img);
    setPredictions(preds);
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: 20, maxWidth: 1100, margin: "0 auto" }}>
      <h1>Station Health Monitor</h1>
      <p style={{ opacity: 0.7 }}>Backend: {API_BASE}</p>

      <button onClick={refreshAll} disabled={loading}>
        {loading ? "Refreshing…" : "Refresh"}
      </button>

      <hr />

      <h2>Health</h2>
      {health ? <pre>{JSON.stringify(health, null, 2)}</pre> : <div>Loading…</div>}

      <h2>Device</h2>
      {device ? (
        <>
          <div>
            Connected:{" "}
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 999,
                background: device.connected ? "#e6fffa" : "#ffe6e6",
                color: device.connected ? "#065f46" : "#7f1d1d",
                border: "1px solid #ccc",
              }}
            >
              {device.connected ? "YES" : "NO"}
            </span>
          </div>

          <div style={{ marginTop: 6 }}>
            Last fault: {device.lastFault ? device.lastFault.type : "—"}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <button onClick={() => injectFault("camera_disconnect")}>camera_disconnect</button>
            <button onClick={() => injectFault("sensor_timeout")}>sensor_timeout</button>
            <button onClick={() => injectFault("gpu_overheat")}>gpu_overheat</button>
          </div>
        </>
      ) : (
        <div>Loading…</div>
      )}

      <h2>Station Metrics</h2>
      <pre>{stationMetrics || "No station metrics yet."}</pre>

      <h2>Image Recognition Demo</h2>
      <p style={{ opacity: 0.7 }}>
        Upload an image to run client-side recognition (MobileNet, runs in browser).
      </p>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            setImgUrl(URL.createObjectURL(f));
            setPredictions([]);
          }
        }}
      />

      {imgUrl && (
        <>
          <div style={{ marginTop: 12 }}>
            <img id="preview-img" src={imgUrl} style={{ maxWidth: 300, borderRadius: 12 }} />
          </div>

          <div style={{ marginTop: 10 }}>
            <button onClick={runRecognition} disabled={!model}>
              {!model ? "Loading model…" : "Run recognition"}
            </button>
          </div>
        </>
      )}

      <ul>
        {predictions.map((p) => (
          <li key={p.className}>
            {p.className} — {(p.probability * 100).toFixed(1)}%
          </li>
        ))}
      </ul>
    </div>
  );
}
