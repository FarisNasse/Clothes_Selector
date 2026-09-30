import { View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { AppText } from '@/components/primitives/AppText';
import { canonicalColor, colorSwatches } from '@/features/wardrobe/catalog';
import { accessoryPlacement, bottomCoverage, topRole, VISUAL_TAXONOMY_VERSION } from '@/features/wardrobe/visual';
import { useExperience } from '@/providers/ExperienceProvider';
import type { Garment } from '@/types/domain';

const stroke = '#45504B';
const tone = (item?: Garment) => item ? colorSwatches[canonicalColor(item.primaryColor)] ?? '#918C80' : '#918C80';

/** Front-view styling illustration. No garment photos or body measurements are projected onto it. */
export function OutfitMannequin({ garments, label = 'THE DAILY EDIT' }: { garments: Garment[]; label?: string }) {
  const { colors: c } = useExperience();
  const top = garments.find((item) => item.category === 'top' && topRole(item.subcategory) === 'base') ??
    garments.find((item) => item.category === 'top');
  const mid = garments.find((item) => item.category === 'top' && item.id !== top?.id);
  const bottom = garments.find((item) => item.category === 'bottom');
  const suit = garments.find((item) => item.category === 'suit');
  const outer = garments.find((item) => item.category === 'outerwear');
  const shoes = garments.find((item) => item.category === 'footwear');
  const accessory = garments.find((item) => item.category === 'accessory');
  const placement = accessory ? accessoryPlacement(accessory.subcategory) : 'unknown';
  const coverage = bottom ? bottomCoverage(bottom.subcategory) : suit ? 'full' : 'unknown';
  const shortSleeves = top && /tee|t-shirt|polo|tank|camp-collar|henley/i.test(top.subcategory);
  const coatLong = outer && /coat|trench|parka|puffer/i.test(outer.subcategory);
  const shapeUnknown = Boolean(bottom && coverage === 'unknown') || placement === 'unknown' && Boolean(accessory);
  return <View accessibilityRole="image" accessibilityLabel={`Illustrative mannequin wearing ${garments.map((item) => item.name).join(', ')}. Fit and drape may differ.`}
    style={{ width: '100%', aspectRatio: .8, borderRadius: 28, overflow: 'hidden', backgroundColor: c.canvas.media, alignItems: 'center' }}>
    <AppText variant="micro" style={{ alignSelf: 'flex-start', marginTop: 18, marginLeft: 20, letterSpacing: 2 }}>{label}</AppText>
    <Svg width="94%" height="88%" viewBox="0 0 300 375" aria-hidden focusable={false}>
      <Ellipse cx="150" cy="357" rx="86" ry="7" fill="#607065" opacity=".12" />
      {/* Deliberately neutral display form, with a stable pose for every outfit. */}
      <G fill="#C8C4BA" stroke="#A8A397" strokeWidth="1">
        <Circle cx="150" cy="38" r="17" />
        <Path d="M140 53 L140 68 L160 68 L160 53" />
        <Path d="M120 75 Q111 74 104 88 L89 169 Q86 179 91 184 Q97 188 101 178 L122 116 Z" />
        <Path d="M180 75 Q189 74 196 88 L211 169 Q214 179 209 184 Q203 188 199 178 L178 116 Z" />
        <Path d="M122 72 Q150 66 178 72 L180 181 L121 181 Z" />
        <Path d="M125 174 L150 177 L149 327 L139 342 L124 331 Z" />
        <Path d="M151 177 L175 174 L176 331 L161 342 L151 327 Z" />
      </G>
      {coverage === 'full' ? <G fill={tone(bottom ?? suit)} stroke={stroke} strokeWidth="1.4">
        <Path d="M123 170 Q150 174 177 170 L178 331 L158 333 L150 211 L142 333 L122 331 Z" />
        <Path d="M123 187 Q150 191 177 187" fill="none" opacity=".45" />
      </G> : coverage === 'short' ? <G fill={tone(bottom)} stroke={stroke} strokeWidth="1.4">
        <Path d="M123 169 Q150 173 177 169 L179 220 L153 221 L150 199 L147 221 L121 220 Z" />
        <Path d="M124 185 Q150 189 176 185" fill="none" opacity=".45" />
      </G> : bottom ? <Rect x="133" y="175" width="34" height="23" rx="4" fill={tone(bottom)} opacity=".5" stroke={stroke} strokeDasharray="4 3" /> : null}
      {top ? <G fill={tone(top)} stroke={stroke} strokeWidth="1.5">
        <Path d={shortSleeves
          ? 'M122 70 L139 67 Q150 80 161 67 L178 70 L194 91 L182 103 L177 94 L176 180 Q150 187 124 180 L123 94 L118 103 L106 91 Z'
          : 'M122 70 L139 67 Q150 80 161 67 L178 70 L194 91 L207 165 L194 171 L175 101 L176 180 Q150 187 124 180 L123 101 L106 171 L93 165 L106 91 Z'} />
        {/shirt|oxford/i.test(top.subcategory) ? <Path d="M139 68 L150 89 L161 68 M150 89 L150 181" fill="none" /> : null}
        {/stripe/i.test(top.pattern) ? <Path d="M126 108 H174 M126 128 H174 M126 148 H174" fill="none" opacity=".45" /> : null}
      </G> : null}
      {mid ? <G fill={tone(mid)} stroke={stroke} strokeWidth="2">
        <Path d="M119 77 L137 72 Q150 82 163 72 L181 77 L196 91 L208 172 L195 176 L177 102 L179 191 Q150 198 121 191 L123 102 L105 176 L92 172 L104 91 Z" />
        {/cardigan/i.test(mid.subcategory) ? <Path d="M150 82 V192" fill="none" /> : null}
      </G> : null}
      {suit ? <G fill={tone(suit)} stroke={stroke} strokeWidth="1.7">
        <Path d="M120 74 L136 70 L150 96 L150 207 L117 204 L119 136 L105 166 L94 161 L105 88 Z" />
        <Path d="M180 74 L164 70 L150 96 L150 207 L183 204 L181 136 L195 166 L206 161 L195 88 Z" />
        <Path d="M136 70 L150 96 L137 113 L143 126 M164 70 L150 96 L163 113 L157 126" fill="none" />
      </G> : null}
      {outer ? <G fill={tone(outer)} stroke={stroke} strokeWidth="1.8">
        <Path d={`M118 76 L134 71 L145 94 L144 ${coatLong ? 274 : 211} L111 ${coatLong ? 270 : 207} L117 130 L102 171 L90 166 L102 88 Z`} />
        <Path d={`M182 76 L166 71 L155 94 L156 ${coatLong ? 274 : 211} L189 ${coatLong ? 270 : 207} L183 130 L198 171 L210 166 L198 88 Z`} />
        <Path d="M134 72 L145 95 L136 111 M166 72 L155 95 L164 111" fill="none" />
      </G> : null}
      {shoes ? <G fill={tone(shoes)} stroke={stroke} strokeWidth="1.5">
        {/boot/i.test(shoes.subcategory) ? <G><Rect x="123" y="313" width="21" height="27" rx="3" /><Rect x="156" y="313" width="21" height="27" rx="3" /></G> : null}
        <Path d="M123 330 L143 330 L149 345 Q147 351 138 351 L106 351 Q102 348 108 341 Z" />
        <Path d="M157 330 L177 330 L192 341 Q198 348 194 351 L162 351 Q153 351 151 345 Z" />
      </G> : null}
      {accessory && placement === 'head' ? <Path d="M132 33 Q133 18 150 18 Q167 18 168 33 Z M127 34 Q150 40 173 34" fill={tone(accessory)} stroke={stroke} strokeWidth="2" /> : null}
      {accessory && placement === 'eyes' ? <Path d="M132 38 H146 L150 40 L154 38 H168 M132 38 Q135 49 145 45 L146 38 M154 38 L155 45 Q165 49 168 38" fill="none" stroke={tone(accessory)} strokeWidth="3" /> : null}
      {accessory && placement === 'neck' ? <Path d="M145 69 L150 92 L155 69 M150 92 L145 143 L150 153 L155 143 Z" fill={tone(accessory)} stroke={stroke} strokeWidth="1.5" /> : null}
      {accessory && placement === 'waist' ? <G><Rect x="120" y="176" width="60" height="6" fill={tone(accessory)} /><Rect x="147" y="175" width="8" height="8" fill="#D7CAB5" stroke={stroke} /></G> : null}
      {accessory && placement === 'wrist' ? <G><Rect x="94" y="161" width="14" height="9" rx="2" fill={tone(accessory)} stroke={stroke} /><Circle cx="101" cy="165" r="4" fill="#E8E4D8" stroke={stroke} /></G> : null}
      {accessory && placement === 'shoulder' ? <G fill="none" stroke={tone(accessory)} strokeWidth="5"><Path d="M176 88 Q202 98 200 153" /><Path d="M186 153 H216 V207 H186 Z" fill={tone(accessory)} /></G> : null}
    </Svg>
    <AppText variant="micro" style={{ position: 'absolute', bottom: 13, left: 20 }}>
      {shapeUnknown ? `ILLUSTRATIVE · SOME SHAPES GENERIC · V${VISUAL_TAXONOMY_VERSION}` : 'ILLUSTRATIVE · FIT AND DRAPE MAY DIFFER'}
    </AppText>
  </View>;
}
