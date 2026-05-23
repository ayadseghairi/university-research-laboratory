interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  tone?: 'brand' | 'success' | 'warning' | 'danger';
  note?: string;
}

export default function StatCard({ icon, label, value, tone = 'brand', note }: StatCardProps) {
  const accent =
    tone === 'success' ? '#0f9d58' : tone === 'warning' ? '#d97706' : tone === 'danger' ? '#dc2626' : '#1f5ee0';

  return (
    <div className="card card-soft" style={{ padding: 20, borderTop: `4px solid ${accent}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div className="muted" style={{ marginBottom: 10 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{value}</div>
          {note ? <div className="help">{note}</div> : null}
        </div>
        <div style={{ width: 54, height: 54, borderRadius: 18, background: `${accent}18`, display: 'grid', placeItems: 'center', color: accent }}>
          <i className={icon} style={{ fontSize: 24 }} />
        </div>
      </div>
    </div>
  );
}
