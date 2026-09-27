import {
  Canvas,
  FilterMode,
  Group,
  ImageShader,
  MipmapMode,
  Rect,
  Shader,
  Skia,
} from "@shopify/react-native-skia";
import { useMemo } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { useOrbImage } from "./orb-images";
import { glassEffect, lensEffect } from "./orb-shaders";
import { useScheme } from "../../hooks/use-theme";

type Props = {
  source: number;
  size: number;
  /** Seat the orb with a shade (day) or glow (night) outside the rim. */
  shadow?: boolean;
  /** Motion of the orb in points per frame, for the liquid inside to lag it. */
  style?: StyleProp<ViewStyle>;
};

const PAD_RATIO = 0.34; // room outside the rim for the halo

/**
 * A photo sealed inside a sphere of glass, rendered with Skia: the picture is
 * refracted by a thin lens shader (a touch of magnification at the bevelled
 * rim, a hair of colour split), and a glass shader draws one hairline of rim
 * light, the window reflection and the halo that seats it on the surface.
 */
export function Orb({ source, size, shadow = true, style }: Props) {
  const scheme = useScheme();
  const image = useOrbImage(source);
  const pad = Math.ceil(size * PAD_RATIO);
  const W = size + 2 * pad;
  const c = pad + size / 2;
  const r = size / 2;

  const clip = useMemo(
    () => Skia.RRectXY(Skia.XYWHRect(pad, pad, size, size), r, r),
    [pad, size, r],
  );

  // Static uniforms: an orb only redraws when its picture, size or scheme changes, never per frame.
  const lensUniforms = useMemo(
    () => ({
      c: [c, c],
      r,
      amount: 0.09,
      bezel: 0.22,
      disp: 0.008,
      slosh: [0, 0],
    }),
    [c, r],
  );
  const glassUniforms = useMemo(
    () => ({
      c: [c, c],
      r,
      night: scheme === "dark" ? 1 : 0,
      halo: shadow ? 1 : 0,
      dv: [0, 0],
    }),
    [c, r, scheme, shadow],
  );

  return (
    <View style={[{ width: size, height: size }, style]} pointerEvents="none">
      <Canvas
        style={[styles.canvas, { width: W, height: W, left: -pad, top: -pad }]}
      >
        {image && (
          <Group clip={clip}>
            <Rect x={pad} y={pad} width={size} height={size}>
              <Shader source={lensEffect} uniforms={lensUniforms}>
                <ImageShader
                  image={image}
                  fit="cover"
                  rect={{ x: pad, y: pad, width: size, height: size }}
                  sampling={{
                    filter: FilterMode.Linear,
                    mipmap: MipmapMode.Linear,
                  }}
                />
              </Shader>
            </Rect>
          </Group>
        )}
        <Rect x={0} y={0} width={W} height={W}>
          <Shader source={glassEffect} uniforms={glassUniforms} />
        </Rect>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    position: "absolute",
  },
});
