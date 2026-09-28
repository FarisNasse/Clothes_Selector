import { useId } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import type { Garment } from '@/types/domain';
import { canonicalColor, colorSwatches } from '@/features/wardrobe/catalog';

export const swatches = colorSwatches;
export function GarmentIllustration({
  garment,
}: {
  garment: Pick<Garment, 'category' | 'primaryColor' | 'subcategory'>;
}) {
  const id = useId().replace(/:/g, '');
  const tone = swatches[canonicalColor(garment.primaryColor)] ?? '#A19B8E';
  const shade = 'rgba(18,26,22,0.24)';
  const shirt = /shirt|oxford/i.test(garment.subcategory);
  const boot = /boot|chelsea/i.test(garment.subcategory);
  const jacket = garment.category === 'outerwear' || garment.category === 'suit';
  const fill = 'url(#' + id + ')';
  return (
    <Svg width="100%" height="100%" viewBox="0 0 220 280" aria-hidden focusable={false}>
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={tone} stopOpacity="0.84" />
          <Stop offset=".32" stopColor={tone} />
          <Stop offset=".74" stopColor={tone} />
          <Stop offset="1" stopColor={tone} stopOpacity="0.8" />
        </LinearGradient>
      </Defs>
      {garment.category === 'bottom' ? (
        <G>
          <Path
            d="M58 17 Q110 24 163 17 L175 249 Q152 256 128 251 L111 111 L97 252 Q72 258 49 250 Z"
            fill={fill}
            stroke={shade}
            strokeWidth="1.4"
          />
          <Path
            d="M58 29 Q110 35 163 29 M110 32 L114 74 Q112 88 105 87 M66 38 Q69 66 57 80 M157 37 Q149 64 166 77 M76 85 L71 240 M144 85 L151 240 M50 243 L96 245 M128 244 L174 242"
            fill="none"
            stroke={shade}
            strokeWidth="1.4"
          />
          <Circle cx="113" cy="27" r="2.4" fill={shade} />
          <Path d="M74 22 L74 36 M150 22 L150 36" stroke={shade} strokeWidth="4" />
        </G>
      ) : garment.category === 'footwear' ? (
        <G transform="translate(5 15) rotate(-12 100 130)">
          {[0, 92].map((x) => (
            <G key={x} transform={'translate(' + x + ' 0)'}>
              {boot ? (
                <Path
                  d="M44 46 Q66 39 80 51 L78 143 Q103 166 93 193 Q65 212 35 186 Q24 167 38 142 Z"
                  fill={fill}
                  stroke={shade}
                  strokeWidth="2"
                />
              ) : (
                <Path
                  d="M51 74 Q77 67 83 91 L90 168 Q87 200 63 207 Q36 208 29 184 Q28 164 38 132 L36 98 Q36 80 51 74 Z"
                  fill={fill}
                  stroke={shade}
                  strokeWidth="2"
                />
              )}
              <Path d="M33 181 Q61 205 91 183 L89 198 Q62 220 35 196 Z" fill={shade} />
              <Ellipse cx="59" cy={boot ? 53 : 94} rx="19" ry="10" fill="rgba(18,26,22,0.48)" />
              <Path
                d={
                  boot
                    ? 'M43 74 L44 128 Q63 137 74 124 L74 76'
                    : 'M38 142 Q60 133 84 140 M39 152 Q60 142 85 149'
                }
                fill="none"
                stroke={shade}
                strokeWidth={boot ? 4 : 2}
              />
            </G>
          ))}
        </G>
      ) : garment.category === 'accessory' ? (
        <G>
          <Rect x="84" y="22" width="51" height="232" rx="13" fill={fill} stroke={shade} />
          <Circle cx="110" cy="134" r="42" fill={tone} stroke="#BBA784" strokeWidth="5" />
          <Circle cx="110" cy="134" r="34" fill="#EAE3D2" />
          <Path d="M110 111 L110 134 L127 144" stroke={tone} strokeWidth="3" fill="none" />
        </G>
      ) : (
        <G>
          <Path
            d={
              jacket || shirt
                ? 'M78 32 L93 22 Q109 35 126 22 L142 32 L173 47 L202 196 L174 205 L151 111 L157 243 Q110 252 63 243 L68 111 L45 205 L18 196 L47 47 Z'
                : 'M78 35 L94 25 Q110 33 126 25 L142 35 L174 50 L203 101 L173 119 L150 81 L154 228 Q111 238 66 228 L70 81 L47 119 L17 101 L46 50 Z'
            }
            fill={fill}
            stroke={shade}
            strokeWidth="1.2"
          />
          <Path
            d="M94 25 L110 46 L126 25 L141 34 L125 65 L110 48 L95 65 L79 35 Z"
            fill={tone}
            stroke={shade}
            strokeWidth="1.5"
          />
          <Path
            d={jacket || shirt ? 'M110 48 L110 243' : 'M110 48 L110 87'}
            stroke={shade}
            strokeWidth={jacket ? 3 : 1.5}
          />
          <Path
            d={
              jacket || shirt
                ? 'M20 189 L45 197 M175 197 L200 189 M65 234 Q111 243 155 234'
                : 'M20 96 L46 113 M175 113 L200 96 M66 220 Q110 230 154 220'
            }
            stroke={shade}
            fill="none"
          />
          {jacket ? (
            <Path d="M75 166 L92 183 M146 166 L129 183" stroke={shade} strokeWidth="3" />
          ) : (
            [69, ...(shirt ? [98, 128, 158, 188, 218] : [81])].map((y) => (
              <Circle key={y} cx="112" cy={y} r="1.8" fill={shade} />
            ))
          )}
          <Path
            d="M69 113 Q77 160 70 207 M150 113 Q143 162 151 208"
            stroke={shade}
            strokeOpacity=".4"
            fill="none"
          />
        </G>
      )}
    </Svg>
  );
}
