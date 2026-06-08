import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { colors, fonts } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  showArrow?: boolean;
  style?: ViewStyle;
};

export default function PrimaryButton({ label, onPress, disabled, showArrow = true, style }: Props) {
  return (
    <TouchableOpacity
      style={[s.btn, disabled && s.btnDisabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <Text style={s.label}>{label}</Text>
      {showArrow && <ArrowRight size={20} color={colors.branco} style={s.arrow} />}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.azulEscuro,
    paddingVertical: 17,
    borderRadius: 28,
    shadowColor: colors.azulEscuro,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  btnDisabled: { backgroundColor: '#B8C4D6', shadowOpacity: 0 },
  label: { fontFamily: fonts.semibold, fontSize: 16, color: colors.branco },
  arrow: { marginLeft: 8 },
});
