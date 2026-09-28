import Svg, { Path, Rect } from 'react-native-svg';
export function BrandMark({ size = 22, color = '#30473B', accent = '#8B7157' }: { size?: number; color?: string; accent?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 32 32" fill="none" accessibilityLabel="Clothes Selector mark">
    <Rect x="3" y="6" width="26" height="2" rx="1" fill={color} />
    <Path d="M11 10h5l11 18h-5L11 10Z" fill={color} />
    <Path d="M21 10h5L10 28H5L21 10Z" fill={accent} />
  </Svg>;
}
