export function DownloadChart() {
  return (
    <div className="chart-wrap">
      <svg viewBox="0 0 760 190" role="img" aria-label="Downloads over 30 days">
        <defs>
          <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity=".18" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="chart-area" d="M0,152 C65,152 75,130 122,133 C170,137 191,109 240,112 C291,114 312,77 361,86 C419,96 429,119 474,91 C515,66 530,39 580,47 C631,55 645,94 700,68 C728,54 746,39 760,34 L760,190 L0,190 Z" />
        <path className="chart-line" d="M0,152 C65,152 75,130 122,133 C170,137 191,109 240,112 C291,114 312,77 361,86 C419,96 429,119 474,91 C515,66 530,39 580,47 C631,55 645,94 700,68 C728,54 746,39 760,34" />
      </svg>
      <div className="chart-axis"><span>Sep 1</span><span>Sep 15</span><span>Sep 30</span></div>
    </div>
  );
}
