/**
 * LOWCAL smoke: a full-screen WebGL fragment shader.
 * Domain-warped fractal noise (after Inigo Quilez, "warp") gives slow,
 * curling vapour. Red ribbons ride the warp field; the pointer stirs it.
 */

const VERT = `
attribute vec2 a;
void main(){ gl_Position = vec4(a, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uStir;
uniform float uIntro;

float hash(vec2 p){
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
const mat2 R = mat2(0.8, 0.6, -0.6, 0.8);
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 6; i++){ v += a * noise(p); p = R * p * 2.03 + 0.17; a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec2 uv0 = uv;
  vec2 m =(uMouse - 0.5 * uRes) / uRes.y;
  float t = uTime * 0.045;

  // pointer swirl: rotate space around the cursor, falling off with distance
  vec2 dm = uv - m;
  float fall = exp(-dot(dm, dm) * 6.0) * uStir;
  float ang = fall * 1.6;
  uv = m + mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * dm;

  vec2 p = uv * 1.35 + vec2(0.0, -t * 0.6);

  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t * 0.8));
  vec2 r = vec2(
    fbm(p + 3.8 * q + vec2(1.7, 9.2) + 0.32 * t),
    fbm(p + 3.8 * q + vec2(8.3, 2.8) - 0.27 * t)
  );
  float f = fbm(p + 3.6 * r);

  // vapour body and thin bright wisps
  float body = smoothstep(0.36, 0.95, f);
  float wisp = pow(smoothstep(0.55, 1.0, f * (0.8 + 0.7 * length(q))), 1.6);
  float ribbon = smoothstep(0.55, 0.85, r.x) * smoothstep(0.45, 0.9, q.y);

  vec3 col = vec3(0.022, 0.022, 0.024);
  col = mix(col, vec3(0.16, 0.16, 0.17), body * 0.7);
  // white vapour only where the red ribbon isn't, so the two never mix to pink
  col = mix(col, vec3(0.94, 0.94, 0.92), wisp * 0.9 * (1.0 - ribbon));
  vec3 red = mix(vec3(0.32, 0.0, 0.015), vec3(0.92, 0.04, 0.08), clamp(wisp * 1.4 + 0.2, 0.0, 1.0));
  col = mix(col, red, ribbon * smoothstep(0.3, 0.8, f));

  // keep a soft pocket behind the type so it stays legible; vignette the edges
  vec2 sv = (gl_FragCoord.xy / uRes) - 0.5;
  float centre = smoothstep(0.0, 0.42, length(sv * vec2(1.25, 1.6)));
  col *= mix(0.58, 1.0, centre);

  // long-exposure light trails: tail lights streaking along a low horizon
  float aspect = uRes.x / uRes.y;
  float hy = -0.36;                                   // horizon, below the wordmark
  float horizon = exp(-pow((uv0.y - hy) * 38.0, 2.0));
  col += vec3(0.85, 0.05, 0.09) * horizon * 0.22;     // red haze on the road line
  col += vec3(1.0) * exp(-pow((uv0.y - hy) * 900.0, 2.0)) * 0.10;
  float trails = 0.0;
  vec3 trailCol = vec3(0.0);
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float y = hy - 0.012 - fi * (0.018 + fi * 0.004);  // lanes fan out towards the viewer
    float w = 900.0 - fi * 110.0;
    float lane = exp(-pow((uv0.y - y) * w, 2.0));
    float dir = mod(fi, 2.0) < 1.0 ? 1.0 : -1.0;       // alternating traffic
    float speed = 0.05 + fi * 0.017;
    float x = fract(uv0.x / aspect * (0.55 + fi * 0.12) + dir * uTime * speed + fi * 0.37);
    float streak = smoothstep(0.0, 0.55, x) * (1.0 - smoothstep(0.55, 0.62, x));
    float a = lane * streak * (0.55 - fi * 0.06);
    vec3 c = dir > 0.0 ? vec3(1.0, 0.08, 0.12) : vec3(0.95, 0.93, 0.9);
    trailCol += c * a;
  }
  col += trailCol * 0.9;

  col *= 1.0 - 0.95 * dot(sv, sv);

  col += (hash(gl_FragCoord.xy + fract(uTime) * 91.0) - 0.5) * 0.035;
  gl_FragColor = vec4(col * uIntro, 1.0);
}
`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error(log);
  }
  return s;
}

export function createSmoke(canvas, { scale = 0.5 } = {}) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) return null;

  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (e) {
    console.warn('Smoke shader unavailable:', e.message);
    return null;
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = {
    res: gl.getUniformLocation(prog, 'uRes'),
    time: gl.getUniformLocation(prog, 'uTime'),
    mouse: gl.getUniformLocation(prog, 'uMouse'),
    stir: gl.getUniformLocation(prog, 'uStir'),
    intro: gl.getUniformLocation(prog, 'uIntro'),
  };

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const state = {
    raf: 0,
    running: false,
    t0: performance.now(),
    mouse: [0, 0],
    target: [0, 0],
    stir: 0,
    stirTarget: 0,
    intro: reduced ? 1 : 0,
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2) * scale;
    const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    if (!state.mouse[0]) {
      state.mouse = [w * 0.62, h * 0.45];
      state.target = [...state.mouse];
    }
  };

  const frame = (now) => {
    resize();
    const t = reduced ? 18 : (now - state.t0) / 1000 + 18;
    state.mouse[0] += (state.target[0] - state.mouse[0]) * 0.06;
    state.mouse[1] += (state.target[1] - state.mouse[1]) * 0.06;
    state.stir += (state.stirTarget - state.stir) * 0.05;
    state.stirTarget *= 0.985;
    state.intro += (1 - state.intro) * 0.02;

    gl.uniform2f(u.res, canvas.width, canvas.height);
    gl.uniform1f(u.time, t);
    gl.uniform2f(u.mouse, state.mouse[0], state.mouse[1]);
    gl.uniform1f(u.stir, state.stir);
    gl.uniform1f(u.intro, state.intro);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (state.running && !reduced) state.raf = requestAnimationFrame(frame);
  };

  const onMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * sx;
    const y = (rect.bottom - e.clientY) * sy;
    const dx = x - state.target[0];
    const dy = y - state.target[1];
    state.target = [x, y];
    state.stirTarget = Math.min(1.4, state.stirTarget + Math.hypot(dx, dy) / canvas.height * 1.8);
  };

  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) start();
    else stop();
  });

  function start() {
    if (state.running) return;
    state.running = true;
    state.raf = requestAnimationFrame(frame);
  }
  function stop() {
    state.running = false;
    cancelAnimationFrame(state.raf);
  }

  window.addEventListener('pointermove', onMove, { passive: true });
  io.observe(canvas);
  resize();
  frame(performance.now());

  return {
    destroy() {
      stop();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      // Free GPU resources but keep the context alive: React may remount on the same canvas.
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    },
  };
}
