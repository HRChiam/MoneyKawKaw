import React from 'react';
import { Text, TextProps } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientTextProps extends TextProps {
  children: string;
  gradient?: {
    colors: string[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
  };
}

const GX_BANK_GRADIENT = {
  colors: ['#771FFF', '#F8326D'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 }, // Horizontal gradient
};

export const GradientText = (props: GradientTextProps) => {
  const { gradient = GX_BANK_GRADIENT, style, ...otherProps } = props;

  return (
    <MaskedView
      maskElement={
        <Text {...otherProps} style={[style, { backgroundColor: 'transparent' }]} />
      }
    >
      <LinearGradient
        colors={gradient.colors}
        start={gradient.start}
        end={gradient.end}
      >
        <Text {...otherProps} style={[style, { opacity: 0 }]}>
          {props.children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
};
