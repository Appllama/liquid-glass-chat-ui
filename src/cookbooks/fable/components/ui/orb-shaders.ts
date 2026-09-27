import { Skia, type SkRuntimeEffect } from "@shopify/react-native-skia";

/**
 * The avatar orb is real glass: two runtime shaders, after the sphere in
 * Appllama's liquid-glass-screens, tuned for small sizes.
 *
 * `lensEffect` is drawn over the photo: a thin lens that barely magnifies the
 * centre (faces must not go broad), bends a little at the bevelled rim, splits
 * the colour channels a hair apart, and lets the picture lag the glass
 * ("slosh") while the orb is moving.
 *
 * `glassEffect` is drawn over it: a breath of milk toward the crown, one
 * hairline of rim light about a point wide at any size, a soft window
 * reflection at the upper left, and a faint halo outside the rim that seats
 * the sphere on the surface (a blue-white glow by night instead of a shade).
 * No dark edge line, no grey inner band, no chroma at the rim: the photo
 * stays clean right up to the glass.
 */
export const LENS_SKSL = `
uniform shader image;
uniform float2 c;
uniform float r;
uniform float amount;   // how much the lens magnifies at the rim
uniform float bezel;    // how much of the radius is the bevelled edge
uniform float disp;     // dispersion: how far apart the three channels land
uniform float2 slosh;   // px: drag the picture inside (held at 0: a per-frame redraw of every orb costs frames)

half4 main(float2 p) {
  float2 d = (p - c) / r;
  float rr = length(d);
  if (rr >= 1.0) return image.eval(p);
  float bev = smoothstep(1.0 - bezel, 1.0, rr);
  float k = amount * (0.30 + 0.70 * bev * bev);
  float2 back = (p - c) * k + slosh * (1.0 - rr * rr);
  half4 cr = image.eval(p - back * (1.0 + disp));
  half4 cg = image.eval(p - back);
  half4 cb = image.eval(p - back * (1.0 - disp));
  float aa = max(cg.a, max(cr.a, cb.a));
  // the glass thickens only in the last tenth of the radius
  float shade = 1.0 - 0.10 * smoothstep(0.90, 1.0, rr);
  return half4(cr.r * shade, cg.g * shade, cb.b * shade, aa);
}
`;

export const GLASS_SKSL = `
uniform float2 c;
uniform float r;
uniform float night;   // 0 = daylight tuning, 1 = night tuning
uniform float halo;    // 0..1 how much the orb is seated by its shade / glow
uniform float2 dv;     // unit vector of motion, for the moving specular

half4 main(float2 p) {
  float2 d = (p - c) / r;
  float rr = length(d);
  if (rr > 1.34) return half4(0.0);
  float aa = 1.4 / r;
  float inside = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, rr);
  float2 nd = d / max(rr, 1e-4);

  // halo outside the rim: a soft shade heavier below by day, a glow by night
  float haloW = mix(0.20, 0.30, night);
  float h = (1.0 - smoothstep(1.0, 1.0 + haloW, rr)) * (1.0 - inside);
  float shDay = h * h * (0.06 + 0.12 * smoothstep(-0.4, 1.0, d.y));
  float shNight = h * h * (0.08 + 0.07 * smoothstep(0.6, -1.0, d.y));
  float sh = mix(shDay, shNight, night) * halo;

  // the body: the faintest milk, a little more toward the crown
  float dome = 1.0 - smoothstep(0.0, 1.0, rr);
  float a = mix(0.015 + 0.03 * dome, 0.01 + 0.02 * dome, night);
  half3 col = mix(half3(1.0), half3(0.93, 0.96, 1.0), half(night));

  // one hairline of rim light, about a point wide whatever the size,
  // brightest toward the window and again along the lower right
  float w = 1.1 / r;
  float rim = smoothstep(1.0 - 2.4 * w, 1.0 - 1.1 * w, rr) * (1.0 - smoothstep(1.0 - 0.5 * w, 1.0, rr));
  float2 lightDir = normalize(float2(-0.55, -0.83) + dv * 0.25);
  float up = clamp(dot(nd, lightDir), 0.0, 1.0);
  float low = clamp(dot(nd, normalize(float2(0.45, 0.89))), 0.0, 1.0);
  a += rim * (0.16 + 0.42 * pow(up, 1.4) + 0.26 * pow(low, 2.0));

  // the window reflection: a soft oval at the upper left, and a small hot core
  float2 sp = d - float2(-0.40, -0.44);
  float2 spr = float2(sp.x * 0.85 + sp.y * 0.53, -sp.x * 0.53 + sp.y * 0.85);
  float spec = exp(-(spr.x * spr.x / 0.12 + spr.y * spr.y / 0.028));
  float2 hp = sp + float2(0.08, 0.05);
  float hot = exp(-(dot(hp, hp) / 0.011));
  a += spec * 0.26 + hot * 0.38;

  a = clamp(a, 0.0, 1.0) * inside + sh;
  half3 haloCol = mix(half3(0.0), half3(0.55, 0.72, 1.0), half(night));
  half3 outc = mix(haloCol, col, half(inside));
  return half4(outc * a, a);
}
`;

function compile(name: string, source: string): SkRuntimeEffect {
  const effect = Skia.RuntimeEffect.Make(source);
  if (!effect) throw new Error(`orb: ${name} shader failed to compile`);
  return effect;
}

export const lensEffect = compile("lens", LENS_SKSL);
export const glassEffect = compile("glass", GLASS_SKSL);
