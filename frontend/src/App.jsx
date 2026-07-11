import React, { useState, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Plus, Calendar, X, Pencil } from "lucide-react";

// ---- Connects to the real FastAPI backend ----
const API_URL = "http://localhost:8000";

const CATEGORY_COLOR = {
  Streaming: "#c65d3b",
  Sport: "#5b7a6b",
  Software: "#8a6fb0",
  Health: "#5b7a6b",
  Other: "#b0a58f",
};

function monthlyCost(sub) {
  if (sub.cycle_charge === "yearly" || sub.cycle_charge === "annual") return sub.value / 12;
  if (sub.cycle_charge === "quarterly") return sub.value / 3;
  return sub.value; // monthly
}

// "today" for the renewal countdown — swap for `new Date()` once you're past mock dates
const TODAY = new Date();

function daysUntil(dateStr) {
  const diff = new Date(dateStr) - TODAY;
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

const currency = (n) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function SubscriptionDashboard() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = creating new, otherwise the id being edited
  const [form, setForm] = useState({ name: "", category: "Streaming", value: "", cycle_charge: "monthly", first_date_charge: new Date().toISOString().split("T")[0] });

  // ---- Load subscriptions from the API on mount ----
  useEffect(() => {
    fetch(`${API_URL}/subscription`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setSubs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load subscriptions:", err);
        setError("Could not reach the API. Is uvicorn running on port 8000?");
        setLoading(false);
      });
  }, []);

  const totalMensal = useMemo(() => subs.reduce((acc, s) => acc + monthlyCost(s), 0), [subs]);
  const totalAnual = totalMensal * 12;

  const byCategory = useMemo(() => {
    const map = {};
    subs.forEach((s) => {
      map[s.category] = (map[s.category] || 0) + monthlyCost(s);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [subs]);

  const upcoming = useMemo(
    () => [...subs]
      .filter((s) => s.first_date_charge)
      .sort((a, b) => daysUntil(a.first_date_charge) - daysUntil(b.first_date_charge)),
    [subs]
  );

  const emptyForm = { name: "", category: "Streaming", value: "", cycle_charge: "monthly", first_date_charge: new Date().toISOString().split("T")[0] };

  // ---- Open the form pre-filled to create a new entry ----
  function openNewForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  // ---- Open the form pre-filled with an existing entry's data ----
  function startEdit(sub) {
    setEditingId(sub.id);
    setForm({
      name: sub.name,
      category: sub.category,
      value: String(sub.value),
      cycle_charge: sub.cycle_charge,
      first_date_charge: sub.first_date_charge,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  // ---- POST a new subscription, or PUT an update to an existing one ----
  function saveSub(e) {
    e.preventDefault();
    if (!form.name || !form.value || !form.first_date_charge) return;

    const isEditing = editingId !== null;
    const url = isEditing ? `${API_URL}/subscription/${editingId}` : `${API_URL}/subscription`;
    const method = isEditing ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        category: form.category,
        value: parseFloat(form.value),
        cycle_charge: form.cycle_charge,
        first_date_charge: form.first_date_charge,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        return res.json();
      })
      .then((result) => {
        if (isEditing) {
          setSubs((prev) => prev.map((s) => (s.id === editingId ? result : s)));
        } else {
          setSubs((prev) => [...prev, result]);
        }
        closeForm();
      })
      .catch((err) => console.error(isEditing ? "Failed to update subscription:" : "Failed to create subscription:", err));
  }

  // ---- DELETE a subscription via the API ----
  function removeSub(id) {
    fetch(`${API_URL}/subscription/${id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        setSubs((prev) => prev.filter((s) => s.id !== id));
      })
      .catch((err) => console.error("Failed to delete subscription:", err));
  }

  const shellStyle = {
    minHeight: "100vh",
    background: "#0f1210",
    color: "#e9e4d8",
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    padding: "32px 20px",
  };
  const fontImport = `
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Serif:wght@600;700&display=swap');
        * { box-sizing: border-box; }
        .receipt { font-family: 'IBM Plex Serif', serif; }
        .ledger-row:hover { background: rgba(233,228,216,0.04); }
        input, select { font-family: 'IBM Plex Mono', monospace; }
        ::selection { background: #c65d3b; color: #0f1210; }
      `;

  if (loading) {
    return (
      <div style={shellStyle}>
        <style>{fontImport}</style>
        <div style={{ maxWidth: 880, margin: "0 auto", color: "#8a8577" }}>Loading subscriptions…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={shellStyle}>
        <style>{fontImport}</style>
        <div style={{ maxWidth: 880, margin: "0 auto", border: "1px solid #c65d3b", padding: 20, color: "#c65d3b" }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <style>{fontImport}</style>

      <div style={{ maxWidth: 880, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, borderBottom: "1px dashed #3a3f38", paddingBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: "#8a8577", marginBottom: 6 }}>MONTHLY STATEMENT</div>
            <h1 className="receipt" style={{ fontSize: 30, margin: 0, fontWeight: 700, color: "#f4f1ea" }}>Subscription Ledger</h1>
          </div>
          <button
            onClick={openNewForm}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#c65d3b", color: "#0f1210", border: "none",
              padding: "10px 16px", fontWeight: 700, fontSize: 13,
              cursor: "pointer", letterSpacing: 0.5,
            }}
          >
            <Plus size={16} /> ADD ENTRY
          </button>
        </div>

        {/* Totals row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1, marginBottom: 32, background: "#3a3f38" }}>
          {[
            { label: "MONTHLY TOTAL", value: currency(totalMensal) },
            { label: "PROJECTED / YEAR", value: currency(totalAnual) },
          ].map((box) => (
            <div key={box.label} style={{ background: "#161a17", padding: "18px 20px" }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#8a8577", marginBottom: 8 }}>{box.label}</div>
              <div className="receipt" style={{ fontSize: 26, fontWeight: 700, color: "#f4f1ea" }}>
                {box.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, marginBottom: 32 }}>

          {/* Ledger table */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: 2, color: "#8a8577", marginBottom: 10 }}>ACTIVE ENTRIES</div>
            <div style={{ border: "1px solid #3a3f38" }}>
              {subs.map((s, i) => {
                return (
                  <div key={s.id} className="ledger-row" style={{
                    display: "grid", gridTemplateColumns: "1fr auto auto auto",
                    gap: 12, alignItems: "center", padding: "12px 14px",
                    borderBottom: i < subs.length - 1 ? "1px dashed #3a3f38" : "none",
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#f4f1ea" }}>
                        {s.name}
                      </div>
                      <div style={{ fontSize: 11, color: "#8a8577" }}>{s.category} · {s.cycle_charge}</div>
                    </div>
                    <div style={{ fontSize: 13, color: "#c9c3b3", textAlign: "right", minWidth: 70 }}>
                      {currency(monthlyCost(s))}<span style={{ fontSize: 10, color: "#8a8577" }}>/mo</span>
                    </div>
                    <button onClick={() => startEdit(s)} style={{ background: "none", border: "none", color: "#5a5f57", cursor: "pointer", padding: 4 }}>
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => removeSub(s.id)} style={{ background: "none", border: "none", color: "#5a5f57", cursor: "pointer", padding: 4 }}>
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category breakdown */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: 2, color: "#8a8577", marginBottom: 10 }}>BY CATEGORY</div>
            <div style={{ border: "1px solid #3a3f38", padding: "16px 8px" }}>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {byCategory.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLOR[entry.name] || CATEGORY_COLOR.Other} stroke="#161a17" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => currency(value)}
                    contentStyle={{ background: "#161a17", border: "1px solid #3a3f38", fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 8px" }}>
                {byCategory.map((c) => (
                  <div key={c.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#c9c3b3" }}>
                      <span style={{ width: 8, height: 8, background: CATEGORY_COLOR[c.name] || CATEGORY_COLOR.Other, display: "inline-block" }} />
                      {c.name}
                    </span>
                    <span style={{ color: "#8a8577" }}>{currency(c.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming renewals */}
        <div>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "#8a8577", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <Calendar size={12} /> UPCOMING RENEWALS
          </div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
            {upcoming.slice(0, 5).map((s) => {
              const days = daysUntil(s.first_date_charge);
              const soon = days <= 5;
              return (
                <div key={s.id} style={{
                  minWidth: 130, border: `1px solid ${soon ? "#c65d3b" : "#3a3f38"}`,
                  padding: "12px 14px", flexShrink: 0,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#f4f1ea", marginBottom: 4 }}>{s.name}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: soon ? "#c65d3b" : "#c9c3b3" }} className="receipt">
                    {days}d
                  </div>
                  <div style={{ fontSize: 10, color: "#8a8577" }}>{currency(s.value)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add entry modal */}
      {showForm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,18,16,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }}>
          <form onSubmit={saveSub} style={{
            background: "#161a17", border: "1px solid #3a3f38",
            padding: 24, width: "100%", maxWidth: 360,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div className="receipt" style={{ fontSize: 18, fontWeight: 700, color: "#f4f1ea" }}>{editingId !== null ? "Edit Entry" : "New Entry"}</div>
              <button type="button" onClick={closeForm} style={{ background: "none", border: "none", color: "#8a8577", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <label style={{ fontSize: 11, color: "#8a8577", display: "block", marginBottom: 4 }}>NAME</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Netflix"
              style={{ width: "100%", background: "#0f1210", border: "1px solid #3a3f38", color: "#f4f1ea", padding: "8px 10px", marginBottom: 14, fontSize: 13 }}
            />

            <label style={{ fontSize: 11, color: "#8a8577", display: "block", marginBottom: 4 }}>CATEGORY</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={{ width: "100%", background: "#0f1210", border: "1px solid #3a3f38", color: "#f4f1ea", padding: "8px 10px", marginBottom: 14, fontSize: 13 }}
            >
              <option>Streaming</option>
              <option>Sport</option>
              <option>Health</option>
              <option>Software</option>
              <option>Other</option>
            </select>

            <label style={{ fontSize: 11, color: "#8a8577", display: "block", marginBottom: 4 }}>PRICE (R$)</label>
            <input
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder="29.90"
              type="number" step="0.01"
              style={{ width: "100%", background: "#0f1210", border: "1px solid #3a3f38", color: "#f4f1ea", padding: "8px 10px", marginBottom: 14, fontSize: 13 }}
            />

            <label style={{ fontSize: 11, color: "#8a8577", display: "block", marginBottom: 4 }}>BILLING CYCLE</label>
            <select
              value={form.cycle_charge}
              onChange={(e) => setForm({ ...form, cycle_charge: e.target.value })}
              style={{ width: "100%", background: "#0f1210", border: "1px solid #3a3f38", color: "#f4f1ea", padding: "8px 10px", marginBottom: 14, fontSize: 13 }}
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>

            <label style={{ fontSize: 11, color: "#8a8577", display: "block", marginBottom: 4 }}>FIRST CHARGE DATE</label>
            <input
              value={form.first_date_charge}
              onChange={(e) => setForm({ ...form, first_date_charge: e.target.value })}
              type="date"
              style={{ width: "100%", background: "#0f1210", border: "1px solid #3a3f38", color: "#f4f1ea", padding: "8px 10px", marginBottom: 20, fontSize: 13, colorScheme: "dark" }}
            />

            <button type="submit" style={{
              width: "100%", background: "#c65d3b", color: "#0f1210",
              border: "none", padding: "10px", fontWeight: 700, cursor: "pointer", fontSize: 13,
            }}>
              {editingId !== null ? "SAVE CHANGES" : "SAVE ENTRY"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}