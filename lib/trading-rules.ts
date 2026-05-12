export type MarketRegime = "UPTREND" | "SIDEWAYS" | "DOWNTREND" | "VOLATILE";

export interface RegimeConfig {
  value: MarketRegime;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  actions: string[];
  avoid: string[];
}

export const REGIME_CONFIGS: RegimeConfig[] = [
  {
    value: "UPTREND",
    label: "Uptrend",
    emoji: "🟢",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-300",
    description: "Pasar dalam tren naik yang jelas. Momentum positif mendukung posisi long.",
    actions: [
      "Prioritaskan posisi LONG",
      "Buy on dip di level support",
      "Manfaatkan breakout volume tinggi",
      "Target lebih besar, trail stop loss",
    ],
    avoid: [
      "Melawan tren dengan SHORT",
      "Cut winner terlalu cepat",
      "Terlalu banyak transaksi di area konsolidasi",
    ],
  },
  {
    value: "SIDEWAYS",
    label: "Sideways",
    emoji: "🟡",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    description: "Pasar bergerak menyamping tanpa tren jelas. Range-bound trading lebih efektif.",
    actions: [
      "Trading di batas range (support/resistance)",
      "Take profit lebih cepat",
      "Kurangi ukuran posisi",
      "Fokus pada saham yang memiliki katalis sendiri",
    ],
    avoid: [
      "Mengejar breakout palsu",
      "Memegang posisi terlalu lama",
      "Transaksi dengan target besar",
    ],
  },
  {
    value: "DOWNTREND",
    label: "Downtrend",
    emoji: "🔴",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
    description: "Pasar dalam tren turun. Risiko lebih tinggi, pertimbangkan untuk mengecilkan eksposur.",
    actions: [
      "Kurangi jumlah open position",
      "Pertahankan cash lebih banyak",
      "Hanya ambil setup terbaik",
      "Perketat stop loss",
    ],
    avoid: [
      "Averaging down tanpa konfirmasi reversal",
      "Menangkap pisau jatuh",
      "FOMO buy setelah koreksi tajam",
    ],
  },
  {
    value: "VOLATILE",
    label: "Volatile",
    emoji: "⚡",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
    description: "Pasar bergejolak dengan volatilitas tinggi. Spread lebar, slippage tinggi.",
    actions: [
      "Perkecil ukuran posisi 50%",
      "Gunakan stop loss lebih lebar",
      "Reduce exposure secara agresif",
      "Prioritaskan manajemen risiko",
    ],
    avoid: [
      "Overtrading karena swing besar",
      "Posisi besar di market terbuka",
      "Mengabaikan gap risk",
    ],
  },
];

export interface TradingRule {
  id: string;
  text: string;
  isCritical?: boolean;
}

export const TRADING_RULES: TradingRule[] = [
  {
    id: "rule_risk",
    text: "Saya tidak akan mengambil risiko lebih dari batas maksimum per transaksi yang telah saya tetapkan.",
    isCritical: true,
  },
  {
    id: "rule_plan",
    text: "Saya hanya akan masuk ke posisi yang memiliki setup dan rencana keluar yang jelas (entry, stop loss, target).",
    isCritical: true,
  },
  {
    id: "rule_stop",
    text: "Saya akan menghormati stop loss saya dan tidak memindahkannya demi menghindari kerugian.",
    isCritical: true,
  },
  {
    id: "rule_emotion",
    text: "Saya tidak akan melakukan transaksi berdasarkan FOMO, dendam pasar, atau emosi sesaat.",
  },
  {
    id: "rule_checklist",
    text: "Saya hanya akan trading jika pre-market checklist menunjukkan saya siap.",
  },
  {
    id: "rule_size",
    text: "Saya akan menjaga jumlah posisi terbuka sesuai batas yang telah ditetapkan.",
  },
  {
    id: "rule_review",
    text: "Setelah sesi trading, saya akan mencatat hasil dan pembelajaran di jurnal.",
  },
];
