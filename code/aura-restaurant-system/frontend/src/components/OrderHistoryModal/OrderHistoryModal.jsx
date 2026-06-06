import React, { useState, useEffect } from "react";
import orderAPI from "../../api/orderAPI";
import "./OrderHistoryModal.css";

const STATUS_CONFIG = {
  PENDING:   { label: "Waiting",   icon: "⏳", color: "#d97706", bg: "#fef3c7", border: "#fcd34d", dot: "#f59e0b" },
  PREPARING: { label: "Preparing", icon: "👨‍🍳", color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd", dot: "#3b82f6" },
  READY:     { label: "Ready",     icon: "✅", color: "#065f46", bg: "#d1fae5", border: "#6ee7b7", dot: "#10b981" },
  DELIVERED: { label: "Delivered", icon: "🚀", color: "#374151", bg: "#f3f4f6", border: "#d1d5db", dot: "#6b7280" },
  PAID:      { label: "Paid",      icon: "💳", color: "#065f46", bg: "#d1fae5", border: "#6ee7b7", dot: "#10b981" },
};

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

const OrderHistoryModal = ({ tableId, sessionId, onClose }) => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      let data;
      if (sessionId) {
        data = await orderAPI.getOrdersBySession(sessionId);
      } else {
        data = await orderAPI.getOrdersByTable(tableId);
      }
      const sorted = [...data].sort(
        (a, b) => new Date(b.orderTime) - new Date(a.orderTime)
      );
      setOrders(sorted);
    } catch (err) {
      setError("Failed to load orders. Please try again.");
      console.error("OrderHistoryModal fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId || tableId) loadOrders();
  }, [sessionId, tableId]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const totalBill = orders
    .filter(o => o.status !== "PAID")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="ohm-overlay" onClick={handleBackdrop}>
      <div className="ohm-modal" role="dialog" aria-modal="true">

        {/* HEADER */}
        <div className="ohm-header">
          <div className="ohm-header-info">
            <span className="ohm-header-icon">🍽️</span>
            <div>
              <h2 className="ohm-header-title">Your Orders</h2>
              <p className="ohm-header-sub">Table {tableId} · Current Session</p>
            </div>
          </div>
          <button className="ohm-btn-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="ohm-center-state">
            <div className="ohm-spinner" />
            <p className="ohm-state-text">Loading orders...</p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="ohm-center-state">
            <span className="ohm-state-icon">⚠️</span>
            <p className="ohm-state-text ohm-error-text">{error}</p>
            <button className="ohm-retry-btn" onClick={loadOrders}>
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && orders.length === 0 && (
          <div className="ohm-center-state">
            <span className="ohm-state-icon">📭</span>
            <p className="ohm-state-text">No orders placed yet</p>
            <p className="ohm-state-sub">Your orders will appear here</p>
          </div>
        )}

        {/* ORDERS LIST */}
        {!loading && !error && orders.length > 0 && (
          <div className="ohm-body">
            <div className="ohm-orders-list">
              {orders.map((order) => {
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                return (
                  <div key={order.orderId} className="ohm-order-row">

                    {/* Order ID + time */}
                    <div className="ohm-order-left">
                      <span className="ohm-order-num">#{order.orderId}</span>
                      <span className="ohm-order-time">{timeAgo(order.orderTime)}</span>
                    </div>

                    {/* Item chips */}
                    <div className="ohm-order-items">
                      {order.items && order.items.length > 0
                        ? order.items.map((item, idx) => (
                            <span key={idx} className="ohm-item-chip">
                              {item.menuItemName} × {item.quantity}
                            </span>
                          ))
                        : <span className="ohm-item-chip">Order #{order.orderId}</span>
                      }
                    </div>

                    {/* Status + amount */}
                    <div className="ohm-order-right">
                      <span
                        className="ohm-badge"
                        style={{
                          color: cfg.color,
                          background: cfg.bg,
                          borderColor: cfg.border,
                        }}
                      >
                        <span className="ohm-badge-dot" style={{ background: cfg.dot }} />
                        {cfg.icon} {cfg.label}
                      </span>
                      <span className="ohm-order-amount">
                        Rs. {order.totalAmount?.toFixed(2)}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* TOTAL BILL */}
            <div className="ohm-total-bar">
              <div className="ohm-total-left">
                <span className="ohm-total-label">Total Bill</span>
                <span className="ohm-total-sub">Excluding paid orders</span>
              </div>
              <span className="ohm-total-amount">Rs. {totalBill.toFixed(2)}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OrderHistoryModal;