import React from 'react';
import { Text, TextProps } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Gradients } from '@/constants/theme';

interface GradientTextProps extends TextProps {
  children: string;
  gradient?: {
    colors: string[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
  };
}

export const GradientText = (props: GradientTextProps) => {
  const { gradient = Gradients.horizontal, style, ...otherProps } = props;

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
