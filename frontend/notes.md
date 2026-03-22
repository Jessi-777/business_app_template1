
how do i know what products are with what affiliate? We now have a partnership with a printing shop. <3 

The current system tracks which products are bought using each affiliate's code through the Orders page. When someone uses an affiliate code at checkout:

The order records the affiliate code and items purchased
View it in Orders page. Go to Admin → Orders, see an "Affiliate" column showing the code used for each order
Click on any order to see the full details including all items purchased with that affiliate code
However, to see a summary of which products each affiliate has sold, add that feature. Create "Affiliate Sales Report"


<!-- CURRENT BUG -->
backend isn't recieving products from the backend in Vercel. 

add domain --> HumanNatureAthletica.com <!-- https://business-app-template1.vercel.app/ -->




italylucasbrand.com → your server → Brand.findOne({ domain: 'italylucasbrand.com' }) → serve their store




<!-- import { useState } from "react";

const INDIGO = "#6366f1";
const INDIGO_DIM = "rgba(99,102,241,0.15)";
const AMBER = "#f59e0b";
const AMBER_DIM = "rgba(245,158,11,0.12)";
const GREEN = "#10b981";
const GREEN_DIM = "rgba(16,185,129,0.12)";
const PURPLE = "#a855f7";
const PURPLE_DIM = "rgba(168,85,247,0.12)";

const statusSteps = [
  { id: "order_received", label: "Order Received", icon: "📥", color: INDIGO, glow: INDIGO_DIM, desc: "Stripe webhook fires → bundle items detected → Nodemailer sends vendor email notification", trigger: "Automatic" },
  { id: "in_production", label: "In Production", icon: "🖨️", color: PURPLE, glow: PURPLE_DIM, desc: "Vendor logs into /vendor dashboard, reviews order details, begins print/production job", trigger: "Vendor updates" },
  { id: "print_complete", label: "Print Complete", icon: "✅", color: AMBER, glow: AMBER_DIM, desc: "Design finished and QC'd by vendor — item ready. Fulfillment path splits here by vendor type.", trigger: "Vendor updates" },
  { id: "fulfillment", label: "Fulfillment Split", icon: "🔀", color: "#ec4899", glow: "rgba(236,72,153,0.12)", desc: "In-house → ships to HNA HQ first. External (Shirtzilla) → ships direct to customer.", trigger: "System routing" },
  { id: "shipped", label: "Shipped", icon: "📦", color: GREEN, glow: GREEN_DIM, desc: "Tracking number entered → customer auto-notified via email", trigger: "Vendor or HNA" },
  { id: "delivered", label: "Delivered", icon: "🏆", color: "#14b8a6", glow: "rgba(20,184,166,0.12)", desc: "Order complete. Customer record updated. Status locked.", trigger: "Auto / manual" },
];

const inHousePath = [
  { step: "Print Complete", icon: "✅", note: "In-house vendor finishes production" },
  { step: "Ships to HNA HQ", icon: "🚚", note: "Vendor ships to your address — NOT the customer" },
  { step: "HNA QC", icon: "🔍", note: "You inspect the product, verify quality" },
  { step: "Brand Packaging", icon: "🎁", note: "Add HNA branded insert, handwritten note, box/mailer" },
  { step: "HNA Ships to Customer", icon: "📬", note: "You enter tracking in admin → customer auto-notified" },
  { step: "Order Complete", icon: "🏆", note: "Full brand experience delivered" },
];

const externalPath = [
  { step: "Print Complete", icon: "✅", note: "Shirtzilla finishes bundle (hat + tee + hoodie)" },
  { step: "Vendor Ships Direct", icon: "🚚", note: "Shirtzilla ships straight to customer address" },
  { step: "Tracking Uploaded", icon: "📋", note: "Vendor enters tracking number in /vendor portal Orders view" },
  { step: "Customer Auto-Notified", icon: "📬", note: "Email fires with tracking info via Nodemailer" },
  { step: "Order Complete", icon: "🏆", note: "Status locked, record updated" },
];

const schemaFields = [
  { field: "vendorType", type: "String", values: "'inhouse' | 'external'", note: "Routes fulfillment logic on order creation" },
  { field: "productionStatus", type: "String", values: "order_received | in_production | print_complete | shipped | delivered", note: "Updated by vendor in dashboard" },
  { field: "fulfillmentMethod", type: "String", values: "'ship_to_hna' | 'ship_direct'", note: "Auto-set based on vendorType" },
  { field: "trackingNumber", type: "String", values: "free text", note: "Entered by vendor (external) or HNA (in-house)" },
  { field: "trackingEnteredBy", type: "String", values: "'vendor' | 'hna'", note: "Audit trail for who submitted tracking" },
  { field: "brandInsertAdded", type: "Boolean", values: "true | false", note: "In-house path only — HNA marks before reshipping" },
  { field: "customerNotifiedAt", type: "Date", values: "ISO timestamp", note: "When tracking email was sent to customer" },
  { field: "statusHistory", type: "Array", values: "[{ status, updatedBy, timestamp }]", note: "Full audit log of all status changes" },
];

export default function HNAVendorArchitecture() {
  const [activeTab, setActiveTab] = useState("flow");
  const [activePath, setActivePath] = useState("inhouse");

  const tab = (t, label) => (
    <button key={t} onClick={() => setActiveTab(t)} style={{
      padding: "8px 20px", borderRadius: "6px 6px 0 0", border: "none", cursor: "pointer",
      fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "0.08em", fontWeight: 600,
      transition: "all 0.2s",
      background: activeTab === t ? "#12121a" : "transparent",
      color: activeTab === t ? "#e2e8f0" : "#475569",
      borderBottom: activeTab === t ? `2px solid ${INDIGO}` : "2px solid transparent",
    }}>{label}</button>
  );

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#e2e8f0", padding: "32px 24px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500;600&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
          {[["HNA VAULT", INDIGO, INDIGO_DIM], ["VENDOR ARCHITECTURE", AMBER, AMBER_DIM], ["FOR JAYR", GREEN, GREEN_DIM]].map(([label, c, bg]) => (
            <div key={label} style={{ background: bg, border: `1px solid ${c}`, borderRadius: "5px", padding: "3px 10px", fontSize: "10px", fontFamily: "'DM Mono', monospace", color: c, letterSpacing: "0.12em", fontWeight: 600 }}>{label}</div>
          ))}
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#f1f5f9", letterSpacing: "-0.02em" }}>Vendor Fulfillment Architecture</h1>
        <p style={{ color: "#475569", fontSize: "13px", marginTop: "4px" }}>Production status flow · Fulfillment routing · Schema fields</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "2px", borderBottom: "1px solid #1e1e2e", marginBottom: "24px" }}>
        {tab("flow", "📋 Production Flow")}
        {tab("paths", "🔀 Fulfillment Paths")}
        {tab("schema", "🗃️ Schema Fields")}
      </div>

      {/* FLOW TAB */}
      {activeTab === "flow" && (
        <div>
          <p style={{ color: "#475569", fontSize: "11px", fontFamily: "'DM Mono', monospace", marginBottom: "20px" }}>BOTH vendor types follow this progression — fulfillment splits at step 4</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {statusSteps.map((s, i) => (
              <div key={s.id} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "38px", paddingTop: "4px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: s.glow, border: `2px solid ${s.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", flexShrink: 0 }}>{s.icon}</div>
                  {i < statusSteps.length - 1 && <div style={{ width: "2px", flex: 1, minHeight: "28px", background: "#1e1e2e" }} />}
                </div>
                <div style={{ flex: 1, background: "#12121a", border: "1px solid #1e1e2e", borderLeft: `3px solid ${s.color}`, borderRadius: "8px", padding: "12px 16px", marginBottom: i < statusSteps.length - 1 ? "8px" : "0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                    <span style={{ fontWeight: 600, fontSize: "13px", color: s.color }}>{s.label}</span>
                    <span style={{ fontSize: "10px", fontFamily: "'DM Mono', monospace", color: "#334155", background: "#0f0f17", border: "1px solid #1e1e2e", padding: "2px 7px", borderRadius: "4px" }}>{s.trigger}</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.5" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PATHS TAB */}
      {activeTab === "paths" && (
        <div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
            {[["inhouse", "⚙️ IN-HOUSE VENDOR", AMBER, AMBER_DIM], ["external", "📦 SHIRTZILLA (EXTERNAL)", INDIGO, INDIGO_DIM]].map(([p, label, c, bg]) => (
              <button key={p} onClick={() => setActivePath(p)} style={{ padding: "8px 16px", borderRadius: "6px", border: `1px solid ${activePath === p ? c : "#1e1e2e"}`, background: activePath === p ? bg : "transparent", color: activePath === p ? c : "#475569", cursor: "pointer", fontSize: "11px", fontFamily: "'DM Mono', monospace", fontWeight: 600, letterSpacing: "0.08em" }}>{label}</button>
            ))}
          </div>

          {activePath === "inhouse" && (
            <>
              <div style={{ background: AMBER_DIM, border: `1px solid ${AMBER}`, borderRadius: "8px", padding: "12px 16px", marginBottom: "18px" }}>
                <p style={{ color: AMBER, fontSize: "11px", fontWeight: 600, marginBottom: "4px", fontFamily: "'DM Mono', monospace" }}>⭐ BRAND CONTROL PATH</p>
                <p style={{ color: "#d97706", fontSize: "12px", lineHeight: 1.5 }}>Vendor ships to HNA HQ. You QC, add branded packaging + insert, reship to customer. Full premium unboxing. <strong>You enter tracking in admin.</strong></p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {inHousePath.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "32px" }}>
                      <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: AMBER_DIM, border: `1px solid ${AMBER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>{item.icon}</div>
                      {i < inHousePath.length - 1 && <div style={{ width: "2px", height: "20px", background: "#1e1e2e", marginTop: "3px" }} />}
                    </div>
                    <div style={{ background: "#12121a", border: "1px solid #1e1e2e", borderLeft: `3px solid ${AMBER}`, borderRadius: "7px", padding: "10px 14px", flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: "12px", color: AMBER, marginBottom: "2px" }}>{item.step}</p>
                      <p style={{ color: "#94a3b8", fontSize: "12px" }}>{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activePath === "external" && (
            <>
              <div style={{ background: INDIGO_DIM, border: `1px solid ${INDIGO}`, borderRadius: "8px", padding: "12px 16px", marginBottom: "18px" }}>
                <p style={{ color: INDIGO, fontSize: "11px", fontWeight: 600, marginBottom: "4px", fontFamily: "'DM Mono', monospace" }}>⚡ SPEED + VOLUME PATH</p>
                <p style={{ color: "#818cf8", fontSize: "12px", lineHeight: 1.5 }}>Shirtzilla ships direct to customer. Vendor enters tracking in /vendor portal. Customer auto-notified. Best for high-volume bundle orders. <strong>Vendor enters tracking.</strong></p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {externalPath.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "32px" }}>
                      <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: INDIGO_DIM, border: `1px solid ${INDIGO}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>{item.icon}</div>
                      {i < externalPath.length - 1 && <div style={{ width: "2px", height: "20px", background: "#1e1e2e", marginTop: "3px" }} />}
                    </div>
                    <div style={{ background: "#12121a", border: "1px solid #1e1e2e", borderLeft: `3px solid ${INDIGO}`, borderRadius: "7px", padding: "10px 14px", flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: "12px", color: INDIGO, marginBottom: "2px" }}>{item.step}</p>
                      <p style={{ color: "#94a3b8", fontSize: "12px" }}>{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* SCHEMA TAB */}
      {activeTab === "schema" && (
        <div>
          <p style={{ color: "#475569", fontSize: "11px", fontFamily: "'DM Mono', monospace", marginBottom: "16px" }}>ORDER MODEL — fields to add in hna-vault</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {schemaFields.map((f, i) => (
              <div key={i} style={{ background: "#12121a", border: "1px solid #1e1e2e", borderRadius: "7px", padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: INDIGO, fontWeight: 600 }}>{f.field}</span>
                  <span style={{ fontSize: "10px", fontFamily: "'DM Mono', monospace", background: PURPLE_DIM, color: "#c084fc", border: "1px solid rgba(168,85,247,0.3)", padding: "1px 6px", borderRadius: "4px" }}>{f.type}</span>
                  <span style={{ fontSize: "10px", color: "#334155", fontFamily: "'DM Mono', monospace" }}>{f.values}</span>
                </div>
                <p style={{ fontSize: "12px", color: "#64748b" }}>{f.note}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "20px", background: GREEN_DIM, border: `1px solid ${GREEN}`, borderRadius: "8px", padding: "14px 16px" }}>
            <p style={{ color: GREEN, fontSize: "11px", fontWeight: 600, marginBottom: "8px", fontFamily: "'DM Mono', monospace" }}>💡 IMPLEMENTATION NOTE FOR JAYR</p>
            <p style={{ color: "#6ee7b7", fontSize: "12px", lineHeight: "1.7" }}>
              <code style={{ background: "#0a0a0f", padding: "1px 5px", borderRadius: "3px", fontFamily: "'DM Mono', monospace", color: INDIGO }}>fulfillmentMethod</code> auto-sets on order creation based on <code style={{ background: "#0a0a0f", padding: "1px 5px", borderRadius: "3px", fontFamily: "'DM Mono', monospace", color: INDIGO }}>vendorType</code>. For in-house vendors, hide the tracking upload field in their dashboard — HNA handles that from admin side. <code style={{ background: "#0a0a0f", padding: "1px 5px", borderRadius: "3px", fontFamily: "'DM Mono', monospace", color: INDIGO }}>statusHistory</code> array gives full audit log so you always know who changed what and when. <code style={{ background: "#0a0a0f", padding: "1px 5px", borderRadius: "3px", fontFamily: "'DM Mono', monospace", color: INDIGO }}>brandInsertAdded</code> is a manual checkbox HNA marks in admin before entering tracking — keeps the fulfillment checklist clean.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} -->
