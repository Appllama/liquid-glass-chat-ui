import React, { useEffect } from "react";
import { View } from "react-native";
import {
  Canvas,
  Fill,
  Shader,
  ImageShader,
  Skia,
  useImage,
  useCanvasRef,
  type SkImage,
} from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";
import { portraits } from "./data";

// Reuse decoded photos when a lens is mounted for the navigation overlay.
// Waiting for useImage again would leave a blank sphere for the first frames.
const decodedPhotos = new Map<number, SkImage>();

// A photograph under a clear convex lens. No colored shell or inset portrait.
// The perimeter bends the original photo; its center remains clean and legible.
const lens = Skia.RuntimeEffect.Make(`
uniform shader photograph;
uniform float size;
uniform float tilt;
half4 main(float2 xy) {
  float2 p = (xy / size - 0.5) * 2.0;
  float r = length(p);
  float aa = 1.0 / size;
  float mask = 1.0 - smoothstep(0.997-aa,0.997+aa,r);
  if (mask < 0.001) return half4(0);
  float travel = clamp(tilt,-2.0,2.0);
  float z = sqrt(max(0.001,1.0-r*r));
  float3 normal = float3(p,z);
  // The photograph is viewed through a convex cap. The broad bevel compresses
  // its outer detail; small colour separation belongs only to that glass edge.
  float bevel = smoothstep(0.70,1.0,r);
  float bend = 1.025 - 0.285*bevel*bevel;
  float2 drift = float2(travel*0.021,-travel*0.008)*(1.0-r*r);
  float2 sampleAt = p*bend + drift;
  float2 split = p*0.006*bevel*bevel;
  half4 red = photograph.eval((sampleAt+split)*size*0.5+size*0.5);
  half4 green = photograph.eval(sampleAt*size*0.5+size*0.5);
  half4 blue = photograph.eval((sampleAt-split)*size*0.5+size*0.5);
  float3 color = float3(red.r,green.g,blue.b);

  // Fresnel reflection increases smoothly around the volume, with no drawn
  // white circle. The opposite dark and bright surfaces give clear glass depth.
  float fresnel = 0.035 + 0.965*pow(1.0-z,4.0);
  float side = dot(normal,normalize(float3(-0.68,-0.46,0.48)));
  float env = 0.22 + 0.66*smoothstep(-0.4,0.75,side);
  color = mix(color,float3(env),fresnel*0.80);
  float shoulder = exp(-pow((r-0.93)/0.036,2.0));
  color *= 1.0-shoulder*(0.10+0.16*smoothstep(-0.4,0.6,p.x-p.y));

  // A window reflected in the dome, bent across its crown. Light has area,
  // direction and a soft falloff, rather than a stroke around the photograph.
  float arch = p.y + 0.79 - 0.40*p.x*p.x;
  float crown = exp(-pow(arch/0.10,2.0)-pow((p.x+0.17-travel*0.035)/0.70,6.0));
  float broad = exp(-pow((p.x+0.34)/0.48,2.0)-pow((p.y+0.65)/0.29,2.0));
  color = mix(color,float3(0.985,0.99,1.0),crown*0.54+broad*0.12);
  float flank = exp(-pow((r-0.90)/0.044,2.0))
    *exp(-pow((atan(p.y,p.x)+2.63)/0.34,2.0));
  color = mix(color,float3(1.0),flank*0.76);
  float returnLight = exp(-pow((r-0.925)/0.040,2.0))
    *smoothstep(0.45,0.94,p.y)*(0.4+0.6*smoothstep(-0.6,0.6,p.x));
  color = mix(color,float3(0.91,0.95,0.98),returnLight*0.56);
  float edgeLight = exp(-pow((r-0.980)/0.006,2.0))
    *pow(max(0.0,dot(p/max(r,0.001),normalize(float2(-0.65,-0.76)))),1.4);
  color = mix(color,float3(1.0),edgeLight*0.62);
  return half4(color*mask,mask);
}`);

export function GlassPortrait({
  index,
  size,
  motion,
  visible = true,
}: {
  index: number;
  size: number;
  motion?: SharedValue<number>;
  dark?: boolean;
  visible?: boolean;
}) {
  const canvas = useCanvasRef();
  useEffect(() => {
    if (!visible) return;
    // Core Animation may discard an occluded drawable during the portrait
    // flight. Repaint the original slot as its native opacity is restored.
    const frame = requestAnimationFrame(() => canvas.current?.redraw());
    return () => cancelAnimationFrame(frame);
  }, [visible, canvas]);
  const loaded = useImage(
    index === 4
      ? require("../../../assets/cookbooks/astra/photos/coast.png")
      : portraits[index % portraits.length],
  );
  if (loaded) decodedPhotos.set(index, loaded);
  const photo = loaded ?? decodedPhotos.get(index);
  const uniforms = useDerivedValue(() => ({ size, tilt: motion?.get() ?? 0 }));
  if (!photo || !lens) return <View style={{ width: size, height: size }} />;
  return (
    <Canvas
      ref={canvas}
      pointerEvents="none"
      style={{ width: size, height: size }}
    >
      <Fill>
        <Shader source={lens} uniforms={uniforms}>
          <ImageShader
            image={photo}
            fit="cover"
            rect={{ x: 0, y: 0, width: size, height: size }}
          />
        </Shader>
      </Fill>
    </Canvas>
  );
}
