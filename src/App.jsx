import { useState, useEffect, useRef } from "react";

const API = "https://cs2-pickem-api-1.onrender.com";

const MAPS = {
  Ancient: "🏛️", Anubis: "🐺", Inferno: "🔥",
  Mirage: "🏜️", Nuke: "☢️", Overpass: "🌉", Vertigo: "🏙️"
};

function useAPI(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    fetch(`${API}${endpoint}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [endpoint]);
  return { data, loading, error };
}

function Scanline() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
    }} />
  );
}

function GlowOrb({ x, y, color }) {
  return (
    <div style={{
      position: "fixed", left: x, top: y, width: 600, height: 600,
      borderRadius: "50%", pointerEvents: "none", zIndex: 0,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      transform: "translate(-50%, -50%)",
      filter: "blur(40px)",
    }} />
  );
}

function Tag({ children, color = "#00ff88" }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      border: `1px solid ${color}44`,
      borderRadius: 3,
      fontSize: 10,
      color,
      letterSpacing: 2,
      fontFamily: "'Courier New', monospace",
      background: `${color}11`,
    }}>{children}</span>
  );
}

function BarStat({ label, value, max = 100, color = "#00ff88" }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: "#666", letterSpacing: 1, fontFamily: "'Courier New', monospace" }}>{label}</span>
        <span style={{ fontSize: 11, color, fontFamily: "'Courier New', monospace", fontWeight: 700 }}>{value}%</span>
      </div>
      <div style={{ height: 3, background: "#111", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: 2,
          transition: "width 1s cubic-bezier(.16,1,.3,1)",
        }} />
      </div>
    </div>
  );
}

function TeamCard({ takim, onClick, selected }) {
  const formColor = takim.form > 70 ? "#00ff88" : takim.form > 50 ? "#ffcc00" : "#ff4444";
  return (
    <div
      onClick={() => onClick(takim)}
      style={{
        padding: "16px 20px",
        background: selected ? "rgba(0,255,136,0.06)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${selected ? "#00ff88" : "#1a1a1a"}`,
        borderRadius: 8,
        cursor: "pointer",
        transition: "all 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {selected && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, #00ff88, transparent)",
        }} />
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 6,
          background: `${formColor}15`,
          border: `1px solid ${formColor}33`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Courier New', monospace", fontSize: 10, fontWeight: 700, color: formColor,
        }}>#{takim.hltv_rank}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0", letterSpacing: 0.5 }}>{takim.isim}</div>
          <Tag color={formColor}>FORM {takim.form}</Tag>
        </div>
        {selected && <div style={{ marginLeft: "auto", color: "#00ff88", fontSize: 18 }}>◆</div>}
      </div>
      <BarStat label="FORM SKORU" value={takim.form} color={formColor} />
    </div>
  );
}

function PickemCard({ takim, rank, type }) {
  const isGood = type === "uc_sifir";
  const color = isGood ? "#00ff88" : "#ff4444";
  const label = isGood ? "3-0" : "0-3";
  return (
    <div style={{
      padding: "20px 24px",
      background: `${color}06`,
      border: `1px solid ${color}22`,
      borderRadius: 10,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${color}88, transparent)`,
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <Tag color={color}>{label} TAHMİNİ #{rank}</Tag>
        <span style={{ fontSize: 24 }}>{isGood ? "🏆" : "💀"}</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: "#f0f0f0", marginBottom: 4, letterSpacing: -0.5 }}>
        {takim[0]}
      </div>
      <BarStat
        label={isGood ? "3-0 İHTİMALİ" : "0-3 İHTİMALİ"}
        value={isGood ? takim[1].uc_sifir_yuzde : takim[1].sifir_uc_yuzde}
        color={color}
      />
    </div>
  );
}

function VetoLog({ log }) {
  const icons = { BAN: "✕", PICK: "✓", DECIDER: "◆" };
  const colors = { BAN: "#ff4444", PICK: "#00ff88", DECIDER: "#ffcc00" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {log.map((adim, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 14px",
          background: `${colors[adim.aksiyon]}08`,
          border: `1px solid ${colors[adim.aksiyon]}22`,
          borderRadius: 6,
          animation: `fadeIn 0.3s ease ${i * 0.08}s both`,
        }}>
          <span style={{ color: colors[adim.aksiyon], fontSize: 12, width: 16, textAlign: "center" }}>
            {icons[adim.aksiyon]}
          </span>
          <span style={{
            fontSize: 10, color: colors[adim.aksiyon], letterSpacing: 2,
            fontFamily: "'Courier New', monospace", width: 60,
          }}>{adim.aksiyon}</span>
          <span style={{ fontSize: 12, color: "#999", flex: 1 }}>{adim.takim}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0" }}>
            {MAPS[adim.harita] || ""} {adim.harita}
          </span>
        </div>
      ))}
    </div>
  );
}

function MacTab() {
  const { data: takimData } = useAPI("/takimlar");
  const [secA, setSecA] = useState(null);
  const [secB, setSecB] = useState(null);
  const [sonuc, setSonuc] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleSelect = (takim) => {
    if (!secA || (secA && secB)) {
      setSecA(takim); setSecB(null); setSonuc(null);
    } else if (secA && takim.isim !== secA.isim) {
      setSecB(takim);
    }
  };

  useEffect(() => {
    if (secA && secB) {
      setYukleniyor(true);
      const a = secA.isim.replace(/ /g, "-");
      const b = secB.isim.replace(/ /g, "-");
      fetch(`${API}/mac/${a}/${b}`)
        .then(r => r.json())
        .then(d => { setSonuc(d); setYukleniyor(false); });
    }
  }, [secA, secB]);

  if (!takimData) return <Loader text="Takımlar yükleniyor..." />;

  return (
    <div>
      <p style={{ color: "#555", fontSize: 12, letterSpacing: 1, marginBottom: 20, fontFamily: "'Courier New', monospace" }}>
        {!secA ? "► İLK TAKIMI SEÇ" : !secB ? `► ${secA.isim.toUpperCase()} SEÇİLDİ — İKİNCİ TAKIMI SEÇ` : "► TAHMİN HESAPLANIYOR"}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 28 }}>
        {takimData.takimlar.map(t => (
          <TeamCard
            key={t.isim}
            takim={t}
            onClick={handleSelect}
            selected={secA?.isim === t.isim || secB?.isim === t.isim}
          />
        ))}
      </div>

      {yukleniyor && <Loader text="BO3 veto simülasyonu çalışıyor..." />}

      {sonuc && !yukleniyor && (
        <div style={{ animation: "fadeIn 0.4s ease" }}>
          {/* Tahmin başlık */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center", gap: 16, marginBottom: 24,
            padding: "24px", background: "rgba(255,255,255,0.02)",
            border: "1px solid #1a1a1a", borderRadius: 10,
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 6, fontFamily: "'Courier New', monospace" }}>TAHMİN</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#00ff88" }}>
                %{sonuc.tahmin[secA.isim]}
              </div>
              <div style={{ fontSize: 14, color: "#f0f0f0", marginTop: 4 }}>{secA.isim}</div>
            </div>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              border: "1px solid #222",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#333", fontSize: 12, fontFamily: "'Courier New', monospace",
            }}>VS</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 6, fontFamily: "'Courier New', monospace" }}>TAHMİN</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#ff4444" }}>
                %{sonuc.tahmin[secB.isim]}
              </div>
              <div style={{ fontSize: 14, color: "#f0f0f0", marginTop: 4 }}>{secB.isim}</div>
            </div>
          </div>

          {/* Veto */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 3, marginBottom: 12, fontFamily: "'Courier New', monospace" }}>
              BO3 VETO SİMÜLASYONU
            </div>
            <VetoLog log={sonuc.veto_log} />
          </div>

          {/* Haritalar */}
          <div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 3, marginBottom: 12, fontFamily: "'Courier New', monospace" }}>
              OYNANACAK HARİTALAR
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sonuc.haritalar.map((h, i) => {
                const favoriRenk = h.favori === secA?.isim ? "#00ff88" : "#ff4444";
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 16px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid #1a1a1a", borderRadius: 8,
                  }}>
                    <span style={{ fontSize: 20 }}>{MAPS[h.harita] || "🗺️"}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f0", flex: 1 }}>{h.harita}</span>
                    <span style={{ fontSize: 10, color: "#555", fontFamily: "'Courier New', monospace" }}>
                      {secA?.isim} %{h[`${secA?.isim}_w`]} — {secB?.isim} %{h[`${secB?.isim}_w`]}
                    </span>
                    <Tag color={favoriRenk}>FAVORİ: {h.favori}</Tag>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Loader({ text }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <div style={{
        display: "inline-block", width: 24, height: 24,
        border: "2px solid #1a1a1a", borderTop: "2px solid #00ff88",
        borderRadius: "50%", animation: "spin 0.8s linear infinite",
        marginBottom: 12,
      }} />
      <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, fontFamily: "'Courier New', monospace" }}>{text}</div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("pickem");
  const { data: pickemData, loading: pickemLoading } = useAPI("/pickem");
  const { data: takimData, loading: takimLoading } = useAPI("/takimlar");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080808",
      color: "#e0e0e0",
      fontFamily: "'Courier New', monospace",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
      `}</style>

      <Scanline />
      <GlowOrb x="20%" y="0%" color="rgba(0,255,136,0.04)" />
      <GlowOrb x="80%" y="60%" color="rgba(255,68,68,0.03)" />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto", padding: "40px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff88", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 10, color: "#00ff88", letterSpacing: 4 }}>SYSTEM ONLINE</span>
          </div>
          <h1 style={{
            fontSize: 36, fontWeight: 900, letterSpacing: -1, lineHeight: 1,
            color: "#f0f0f0", marginBottom: 8,
          }}>
            CS2 PICK'EM<br />
            <span style={{ color: "#00ff88" }}>AI TAHMİN</span>
          </h1>
          <p style={{ fontSize: 11, color: "#444", letterSpacing: 2 }}>
            SWISS SİSTEM · 1000 SENARYO · HARITA VETO ANALİZİ
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 32, borderBottom: "1px solid #111" }}>
          {[["pickem", "AI PICKEMi"], ["takimlar", "TAKIMLAR"], ["mac", "MAÇ TAHMİNİ"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "10px 20px", fontSize: 10, letterSpacing: 3,
              color: tab === id ? "#00ff88" : "#333",
              borderBottom: tab === id ? "2px solid #00ff88" : "2px solid transparent",
              transition: "all 0.15s",
              fontFamily: "'Courier New', monospace",
            }}>{label}</button>
          ))}
        </div>

        {/* PICKEM TAB */}
        {tab === "pickem" && (
          <div>
            {pickemLoading ? <Loader text="1000 simülasyon çalışıyor..." /> : pickemData && (
              <div style={{ animation: "fadeIn 0.4s ease" }}>
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 10, color: "#555", letterSpacing: 3, marginBottom: 16 }}>AI ÖNERİLERİ</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    {pickemData.oneriler.uc_sifir.map((t, i) => (
                      <PickemCard key={i} takim={t} rank={i + 1} type="uc_sifir" />
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {pickemData.oneriler.sifir_uc.map((t, i) => (
                      <PickemCard key={i} takim={t} rank={i + 1} type="sifir_uc" />
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 10, color: "#555", letterSpacing: 3, marginBottom: 12 }}>TÜM TAKIMLAR — İLERLEME İHTİMALİ</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {pickemData.pickem.map((t, i) => (
                      <div key={t.takim} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 16px",
                        background: "rgba(255,255,255,0.015)",
                        border: "1px solid #111", borderRadius: 6,
                        animation: `fadeIn 0.3s ease ${i * 0.05}s both`,
                      }}>
                        <span style={{ color: "#333", fontSize: 11, width: 20 }}>{i + 1}</span>
                        <span style={{ flex: 1, fontSize: 13, color: "#ccc", fontWeight: 600 }}>{t.takim}</span>
                        <div style={{ width: 160 }}>
                          <BarStat
                            label="İLERLEME"
                            value={t.ilerleme_yuzde}
                            color={t.ilerleme_yuzde > 60 ? "#00ff88" : t.ilerleme_yuzde > 30 ? "#ffcc00" : "#ff4444"}
                          />
                        </div>
                        <Tag color={t.uc_sifir_yuzde > 20 ? "#00ff88" : "#333"}>3-0: %{t.uc_sifir_yuzde}</Tag>
                        <Tag color={t.sifir_uc_yuzde > 20 ? "#ff4444" : "#333"}>0-3: %{t.sifir_uc_yuzde}</Tag>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAKIMLAR TAB */}
        {tab === "takimlar" && (
          <div>
            {takimLoading ? <Loader text="Veri çekiliyor..." /> : takimData && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, animation: "fadeIn 0.4s ease" }}>
                {takimData.takimlar.map((t, i) => (
                  <TeamCard key={t.isim} takim={t} onClick={() => {}} selected={false} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* MAÇ TAB */}
        {tab === "mac" && <MacTab />}

        {/* Footer */}
        <div style={{
          marginTop: 48, paddingTop: 20, borderTop: "1px solid #0f0f0f",
          display: "flex", justifyContent: "space-between",
          fontSize: 10, color: "#222", letterSpacing: 2,
        }}>
          <span>CS2 PICK'EM AI</span>
          <span>API: {API}</span>
        </div>
      </div>
    </div>
  );
}