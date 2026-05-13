'use client'

import { ProfileKey } from '@/data/profiles'

interface Props {
  profileKey: ProfileKey
  params: Record<string, number>
}

const HATCH = `
  <defs>
    <pattern id="hatch" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="5" stroke="#90A4AE" stroke-width="0.7"/>
    </pattern>
  </defs>
`

function svgWrap(content: string, w = 260, h = 220) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${HATCH}${content}</svg>`
}

const dim = (color = '#1565C0') => `stroke="${color}" stroke-width="1" fill="none"`
const label = (x: number, y: number, text: string, color = '#1565C0') =>
  `<text x="${x}" y="${y}" font-size="11" fill="${color}" font-family="sans-serif">${text}</text>`

const diagrams: Record<ProfileKey, (p: Record<string, number>) => string> = {
  pipe: () => svgWrap(`
    <circle cx="130" cy="110" r="90" fill="url(#hatch)" stroke="#455A64" stroke-width="1.5"/>
    <circle cx="130" cy="110" r="60" fill="white" stroke="#455A64" stroke-width="1.5"/>
    <line x1="130" y1="110" x2="220" y2="110" stroke="#455A64" stroke-width="1" stroke-dasharray="4,3"/>
    <line x1="190" y1="110" x2="220" y2="110" stroke="#1565C0" stroke-width="2"/>
    <line x1="130" y1="110" x2="190" y2="110" stroke="#455A64" stroke-width="1" stroke-dasharray="4,3"/>
    ${label(192, 104, 't')}
    ${label(155, 135, 'd', '#455A64')}
  `),

  round: () => svgWrap(`
    <circle cx="130" cy="110" r="90" fill="url(#hatch)" stroke="#455A64" stroke-width="1.5"/>
    <line x1="130" y1="110" x2="220" y2="110" stroke="#1565C0" stroke-width="1.5"/>
    <line x1="128" y1="108" x2="130" y2="106" stroke="#1565C0" stroke-width="1"/>
    <line x1="132" y1="108" x2="130" y2="106" stroke="#1565C0" stroke-width="1"/>
    ${label(170, 104, 'd')}
  `),

  rod: () => svgWrap(`
    <circle cx="130" cy="110" r="90" fill="url(#hatch)" stroke="#455A64" stroke-width="1.5"/>
    <circle cx="130" cy="110" r="12" fill="white" stroke="#455A64" stroke-width="1"/>
    <line x1="130" y1="110" x2="220" y2="110" stroke="#1565C0" stroke-width="1.5"/>
    ${label(168, 104, 'd')}
  `),

  square: () => svgWrap(`
    <rect x="40" y="20" width="180" height="180" fill="url(#hatch)" stroke="#455A64" stroke-width="1.5"/>
    <line x1="40" y1="210" x2="220" y2="210" stroke="#1565C0" stroke-width="1"/>
    <line x1="40" y1="206" x2="40" y2="214" stroke="#1565C0" stroke-width="1"/>
    <line x1="220" y1="206" x2="220" y2="214" stroke="#1565C0" stroke-width="1"/>
    ${label(123, 219, 'a')}
  `),

  hexagon: () => svgWrap(`
    <polygon points="130,22 220,72 220,148 130,198 40,148 40,72" fill="url(#hatch)" stroke="#455A64" stroke-width="1.5"/>
    <line x1="40" y1="110" x2="220" y2="110" stroke="#1565C0" stroke-width="1" stroke-dasharray="4,3"/>
    <line x1="38" y1="106" x2="38" y2="114" stroke="#1565C0" stroke-width="1"/>
    <line x1="222" y1="106" x2="222" y2="114" stroke="#1565C0" stroke-width="1"/>
    ${label(120, 104, 'd')}
  `),

  pipe_prof: () => svgWrap(`
    <rect x="30" y="30" width="200" height="160" fill="url(#hatch)" stroke="#455A64" stroke-width="1.5"/>
    <rect x="55" y="55" width="150" height="110" fill="white" stroke="#455A64" stroke-width="1.2"/>
    <line x1="30" y1="205" x2="230" y2="205" stroke="#1565C0" stroke-width="1"/>
    <line x1="30" y1="201" x2="30" y2="209" stroke="#1565C0" stroke-width="1"/>
    <line x1="230" y1="201" x2="230" y2="209" stroke="#1565C0" stroke-width="1"/>
    ${label(122, 215, 'A')}
    <line x1="238" y1="30" x2="238" y2="190" stroke="#1565C0" stroke-width="1"/>
    <line x1="234" y1="30" x2="242" y2="30" stroke="#1565C0" stroke-width="1"/>
    <line x1="234" y1="190" x2="242" y2="190" stroke="#1565C0" stroke-width="1"/>
    ${label(232, 115, 'B')}
    ${label(33, 48, 't', '#455A64')}
  `),

  sheet: () => svgWrap(`
    <rect x="20" y="70" width="220" height="80" fill="url(#hatch)" stroke="#455A64" stroke-width="1.5"/>
    <line x1="20" y1="165" x2="240" y2="165" stroke="#1565C0" stroke-width="1"/>
    <line x1="20" y1="161" x2="20" y2="169" stroke="#1565C0" stroke-width="1"/>
    <line x1="240" y1="161" x2="240" y2="169" stroke="#1565C0" stroke-width="1"/>
    ${label(122, 176, 'a')}
    <line x1="248" y1="70" x2="248" y2="150" stroke="#1565C0" stroke-width="1"/>
    <line x1="244" y1="70" x2="252" y2="70" stroke="#1565C0" stroke-width="1"/>
    <line x1="244" y1="150" x2="252" y2="150" stroke="#1565C0" stroke-width="1"/>
    ${label(241, 115, 't')}
  `),

  plate: () => svgWrap(`
    <rect x="20" y="55" width="220" height="110" fill="url(#hatch)" stroke="#455A64" stroke-width="1.5"/>
    <line x1="20" y1="178" x2="240" y2="178" stroke="#1565C0" stroke-width="1"/>
    <line x1="20" y1="174" x2="20" y2="182" stroke="#1565C0" stroke-width="1"/>
    <line x1="240" y1="174" x2="240" y2="182" stroke="#1565C0" stroke-width="1"/>
    ${label(122, 192, 'a')}
    <line x1="248" y1="55" x2="248" y2="165" stroke="#1565C0" stroke-width="1"/>
    <line x1="244" y1="55" x2="252" y2="55" stroke="#1565C0" stroke-width="1"/>
    <line x1="244" y1="165" x2="252" y2="165" stroke="#1565C0" stroke-width="1"/>
    ${label(241, 115, 't')}
  `),

  strip: () => svgWrap(`
    <rect x="20" y="90" width="220" height="40" fill="url(#hatch)" stroke="#455A64" stroke-width="1.5"/>
    <line x1="20" y1="145" x2="240" y2="145" stroke="#1565C0" stroke-width="1"/>
    <line x1="20" y1="141" x2="20" y2="149" stroke="#1565C0" stroke-width="1"/>
    <line x1="240" y1="141" x2="240" y2="149" stroke="#1565C0" stroke-width="1"/>
    ${label(122, 158, 'b')}
    <line x1="248" y1="90" x2="248" y2="130" stroke="#1565C0" stroke-width="1"/>
    <line x1="244" y1="90" x2="252" y2="90" stroke="#1565C0" stroke-width="1"/>
    <line x1="244" y1="130" x2="252" y2="130" stroke="#1565C0" stroke-width="1"/>
    ${label(241, 114, 't')}
  `),

  flat: () => svgWrap(`
    <rect x="20" y="75" width="220" height="70" fill="url(#hatch)" stroke="#455A64" stroke-width="1.5"/>
    <line x1="20" y1="160" x2="240" y2="160" stroke="#1565C0" stroke-width="1"/>
    <line x1="20" y1="156" x2="20" y2="164" stroke="#1565C0" stroke-width="1"/>
    <line x1="240" y1="156" x2="240" y2="164" stroke="#1565C0" stroke-width="1"/>
    ${label(122, 173, 'b')}
    <line x1="248" y1="75" x2="248" y2="145" stroke="#1565C0" stroke-width="1"/>
    <line x1="244" y1="75" x2="252" y2="75" stroke="#1565C0" stroke-width="1"/>
    <line x1="244" y1="145" x2="252" y2="145" stroke="#1565C0" stroke-width="1"/>
    ${label(241, 115, 't')}
  `),

  beam: () => svgWrap(`
    <rect x="20" y="10" width="220" height="28" fill="url(#hatch)" stroke="#455A64" stroke-width="1.2"/>
    <rect x="106" y="38" width="48" height="134" fill="url(#hatch)" stroke="#455A64" stroke-width="1.2"/>
    <rect x="20" y="172" width="220" height="28" fill="url(#hatch)" stroke="#455A64" stroke-width="1.2"/>
    <line x1="248" y1="10" x2="248" y2="200" stroke="#1565C0" stroke-width="1"/>
    <line x1="244" y1="10" x2="252" y2="10" stroke="#1565C0" stroke-width="1"/>
    <line x1="244" y1="200" x2="252" y2="200" stroke="#1565C0" stroke-width="1"/>
    ${label(240, 110, 'H')}
    <line x1="20" y1="6" x2="240" y2="6" stroke="#455A64" stroke-width="1"/>
    ${label(118, 3, 'B', '#455A64')}
  `),

  channel: () => svgWrap(`
    <rect x="20" y="10" width="140" height="26" fill="url(#hatch)" stroke="#455A64" stroke-width="1.2"/>
    <rect x="20" y="36" width="42" height="138" fill="url(#hatch)" stroke="#455A64" stroke-width="1.2"/>
    <rect x="20" y="174" width="140" height="26" fill="url(#hatch)" stroke="#455A64" stroke-width="1.2"/>
    <line x1="180" y1="10" x2="180" y2="200" stroke="#1565C0" stroke-width="1"/>
    <line x1="176" y1="10" x2="184" y2="10" stroke="#1565C0" stroke-width="1"/>
    <line x1="176" y1="200" x2="184" y2="200" stroke="#1565C0" stroke-width="1"/>
    ${label(173, 110, 'H')}
    ${label(60, 8, 'B', '#455A64')}
  `),

  angle_equal: () => svgWrap(`
    <polygon points="20,10 52,10 52,190 200,190 200,210 20,210" fill="url(#hatch)" stroke="#455A64" stroke-width="1.5"/>
    <line x1="8" y1="10" x2="8" y2="210" stroke="#1565C0" stroke-width="1"/>
    <line x1="4" y1="10" x2="12" y2="10" stroke="#1565C0" stroke-width="1"/>
    <line x1="4" y1="210" x2="12" y2="210" stroke="#1565C0" stroke-width="1"/>
    ${label(1, 115, 'a')}
    <line x1="20" y1="222" x2="200" y2="222" stroke="#1565C0" stroke-width="1"/>
    <line x1="20" y1="218" x2="20" y2="226" stroke="#1565C0" stroke-width="1"/>
    <line x1="200" y1="218" x2="200" y2="226" stroke="#1565C0" stroke-width="1"/>
    ${label(102, 218, 'a')}
  `),

  angle_unequal: () => svgWrap(`
    <polygon points="20,10 52,10 52,190 220,190 220,210 20,210" fill="url(#hatch)" stroke="#455A64" stroke-width="1.5"/>
    <line x1="8" y1="10" x2="8" y2="210" stroke="#1565C0" stroke-width="1"/>
    <line x1="4" y1="10" x2="12" y2="10" stroke="#1565C0" stroke-width="1"/>
    <line x1="4" y1="210" x2="12" y2="210" stroke="#1565C0" stroke-width="1"/>
    ${label(1, 115, 'a')}
    <line x1="20" y1="222" x2="220" y2="222" stroke="#1565C0" stroke-width="1"/>
    <line x1="20" y1="218" x2="20" y2="226" stroke="#1565C0" stroke-width="1"/>
    <line x1="220" y1="218" x2="220" y2="226" stroke="#1565C0" stroke-width="1"/>
    ${label(112, 218, 'b')}
  `),

  armature: () => svgWrap(`
    <circle cx="130" cy="110" r="88" fill="url(#hatch)" stroke="#455A64" stroke-width="1.5"/>
    <line x1="42" y1="85" x2="218" y2="85" stroke="#455A64" stroke-width="2.5" stroke-dasharray="6,3"/>
    <line x1="42" y1="135" x2="218" y2="135" stroke="#455A64" stroke-width="2.5" stroke-dasharray="6,3"/>
    <line x1="130" y1="110" x2="218" y2="110" stroke="#1565C0" stroke-width="1.5"/>
    ${label(168, 104, 'd')}
  `),

  wire: () => svgWrap(`
    <circle cx="130" cy="110" r="50" fill="url(#hatch)" stroke="#455A64" stroke-width="1.5"/>
    <line x1="130" y1="110" x2="180" y2="110" stroke="#1565C0" stroke-width="1.5"/>
    ${label(149, 104, 'd')}
    <path d="M20 110 Q45 70 70 110 Q95 150 130 110" stroke="#455A64" stroke-width="1" fill="none" stroke-dasharray="3,2" opacity="0.5"/>
  `),

  rail: () => svgWrap(`
    <rect x="55" y="10" width="150" height="30" fill="url(#hatch)" stroke="#455A64" stroke-width="1.2"/>
    <rect x="100" y="40" width="60" height="110" fill="url(#hatch)" stroke="#455A64" stroke-width="1.2"/>
    <rect x="30" y="150" width="200" height="40" fill="url(#hatch)" stroke="#455A64" stroke-width="1.2"/>
    <line x1="245" y1="10" x2="245" y2="190" stroke="#1565C0" stroke-width="1"/>
    <line x1="241" y1="10" x2="249" y2="10" stroke="#1565C0" stroke-width="1"/>
    <line x1="241" y1="190" x2="249" y2="190" stroke="#1565C0" stroke-width="1"/>
    ${label(237, 105, 'H')}
  `),

  shpunt: () => svgWrap(`
    <polygon points="20,200 20,110 65,55 110,110 110,200" fill="url(#hatch)" stroke="#455A64" stroke-width="1.5"/>
    <polygon points="25,200 25,115 65,65 105,115 105,200" fill="white" stroke="#455A64" stroke-width="1"/>
    <polygon points="110,200 110,110 155,55 200,110 200,200" fill="url(#hatch)" stroke="#455A64" stroke-width="1.5"/>
    <polygon points="115,200 115,115 155,65 195,115 195,200" fill="white" stroke="#455A64" stroke-width="1"/>
    <line x1="215" y1="55" x2="215" y2="200" stroke="#1565C0" stroke-width="1"/>
    <line x1="211" y1="55" x2="219" y2="55" stroke="#1565C0" stroke-width="1"/>
    <line x1="211" y1="200" x2="219" y2="200" stroke="#1565C0" stroke-width="1"/>
    ${label(208, 132, 'H')}
  `),
}

export default function ProfileDiagram({ profileKey, params }: Props) {
  const svgContent = diagrams[profileKey]?.(params) ?? diagrams.round(params)

  return (
    <div
      style={{ width: "100%", maxWidth: 400, maxHeight: 320 }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  )
}
