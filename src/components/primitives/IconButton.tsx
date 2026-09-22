import { Ionicons } from '@expo/vector-icons';
import { AnimatedPressable } from '@/components/motion/AnimatedPressable';
import { useExperience } from '@/providers/ExperienceProvider';
type Props = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
};
export function IconButton({ label, icon, onPress, selected = false, disabled = false }: Props) {
  const { colors: c } = useExperience();
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: selected ? c.accent.forestMist : c.canvas.elevated,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Ionicons name={icon} size={21} color={selected ? c.accent.forest : c.ink.primary} />
    </AnimatedPressable>
  );
}
