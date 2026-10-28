'use client'

export function Ticker() {
  const items = [
    { symbol: 'BTC/USD', price: '67,842.50', change: '+2.34%', up: true },
    { symbol: 'EUR/USD', price: '1.0875', change: '-0.12%', up: false },
    { symbol: 'SP500', price: '5,248.80', change: '+0.67%', up: true },
    { symbol: 'GOLD', price: '2,318.40', change: '+0.89%', up: true },
    { symbol: 'ETH/USD', price: '3,421.20', change: '+3.15%', up: true },
    { symbol: 'GBP/USD', price: '1.2743', change: '-0.08%', up: false },
    { symbol: 'NASDAQ', price: '18,324.10', change: '+1.23%', up: true },
    { symbol: 'OIL/WTI', price: '78.45', change: '-1.02%', up: false },
  ]

  const doubled = [...items, ...items]

  return (
    <div className="fixed top-0 left-0 right-0 z-40 h-8 bg-dark-900/95 border-b border-white/5 overflow-hidden">
      <div className="flex animate-ticker whitespace-nowrap h-full items-center">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-6 text-xs font-mono">
            <span className="text-white/60">{item.symbol}</span>
            <span className="text-white font-semibold">{item.price}</span>
            <span className={item.up ? 'text-green-trading' : 'text-red-400'}>
              {item.up ? '▲' : '▼'} {item.change}
            </span>
            <span className="text-white/10 ml-4">|</span>
          </span>
        ))}
      </div>
    </div>
  )
}
