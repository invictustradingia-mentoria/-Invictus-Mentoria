'use client'

import { useEffect, useMemo, useState } from 'react'
import { geoNaturalEarth1, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'

export interface MapPoint { lat: number; lon: number; online: boolean; label: string }

const W = 800
const H = 410

export default function WorldMap({ points }: { points: MapPoint[] }) {
  const [land, setLand] = useState<any>(null)

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((r) => r.json())
      .then((topo) => setLand(feature(topo, topo.objects.countries)))
      .catch(() => setLand(null))
  }, [])

  const projection = useMemo(() => geoNaturalEarth1().fitSize([W, H], { type: 'Sphere' } as any), [])
  const path = useMemo(() => geoPath(projection), [projection])

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
      <path d={path({ type: 'Sphere' } as any) || ''} fill="#f0f9ff" stroke="#e0f2fe" />
      {land?.features?.map((f: any, i: number) => (
        <path key={i} d={path(f) || ''} fill="#cbd5e1" stroke="#fff" strokeWidth={0.5} />
      ))}
      {points.map((p, i) => {
        const xy = projection([p.lon, p.lat])
        if (!xy) return null
        return (
          <g key={i} transform={`translate(${xy[0]},${xy[1]})`}>
            {p.online && <circle r="9" fill="#10b981" opacity=".25"><animate attributeName="r" values="5;14;5" dur="2s" repeatCount="indefinite" /></circle>}
            <circle r="4.5" fill={p.online ? '#10b981' : '#0ea5e9'} stroke="#fff" strokeWidth="1.5"><title>{p.label}</title></circle>
          </g>
        )
      })}
    </svg>
  )
}