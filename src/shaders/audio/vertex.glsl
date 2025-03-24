uniform float uFrequencies[512];

varying float vOffset;

void main() {

  float d = length(position);
  int i = int(mod(abs(d * 0.5), 512.));

  float f = uFrequencies[i];
  float offset = f / 512.;
  offset += sin(f * 0.1) * 0.3;

  vOffset = offset;

  vec3 pos = position;
  pos.y += offset * 10. - 2.;

  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0);
}