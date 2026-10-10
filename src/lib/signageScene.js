// Escena 3D de la demo de signage (caso Wink App). Se importa de forma
// dinámica: three.js solo se descarga cuando la demo entra en pantalla.
//
// La pantalla muestra un <canvas> 2D (el contenido de la playlist) como
// textura; la escena solo agrega el objeto físico, luz y movimiento.
import {
  AmbientLight,
  BoxGeometry,
  CanvasTexture,
  CircleGeometry,
  DirectionalLight,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";

export const supportsWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
};

// Sombra suave en el "piso": un círculo con degradé radial.
const shadowTexture = () => {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(0,0,0,0.55)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new CanvasTexture(c);
};

/**
 * @param {HTMLCanvasElement} target  canvas donde renderiza WebGL
 * @param {HTMLCanvasElement} content canvas 2D con el contenido de la pantalla
 */
export function createSignageScene(target, content) {
  const renderer = new WebGLRenderer({ canvas: target, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.2, 5.1);

  scene.add(new AmbientLight(0xffffff, 0.7));
  const key = new DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new DirectionalLight(0x4ade80, 0.9);
  rim.position.set(-4, 1, -3);
  scene.add(rim);

  const tv = new Group();
  scene.add(tv);

  // Bisel + carcasa
  const W = 3.2;
  const H = 1.8;
  const bezelMat = new MeshStandardMaterial({ color: 0x111827, metalness: 0.55, roughness: 0.35 });
  const body = new Mesh(new BoxGeometry(W + 0.12, H + 0.12, 0.12), bezelMat);
  tv.add(body);

  // Pantalla: textura del canvas de contenido
  const texture = new CanvasTexture(content);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const display = new Mesh(new PlaneGeometry(W, H), new MeshBasicMaterial({ map: texture, toneMapped: false }));
  display.position.z = 0.061;
  tv.add(display);

  // LED de encendido
  const led = new Mesh(new CircleGeometry(0.018, 16), new MeshBasicMaterial({ color: 0x22c55e }));
  led.position.set(0, -H / 2 - 0.035, 0.062);
  tv.add(led);

  // Pie
  const stand = new Mesh(new BoxGeometry(0.12, 0.55, 0.08), bezelMat);
  stand.position.set(0, -H / 2 - 0.3, -0.02);
  tv.add(stand);
  const base = new Mesh(new BoxGeometry(1.1, 0.05, 0.5), bezelMat);
  base.position.set(0, -H / 2 - 0.58, 0);
  tv.add(base);

  const shadow = new Mesh(
    new PlaneGeometry(4.2, 1.6),
    new MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -H / 2 - 0.61;
  tv.add(shadow);

  tv.position.y = 0.25;

  // Estado de interacción
  const pointer = { x: 0, y: 0 };
  const rot = { x: 0, y: 0 };
  let raf = 0;
  let running = false;
  const t0 = performance.now();

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = target;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  const frame = () => {
    const t = (performance.now() - t0) / 1000;
    // Inclinación hacia el puntero, suavizada, más una flotación lenta.
    rot.y += (pointer.x * 0.45 - 0.22 - rot.y) * 0.06;
    rot.x += (pointer.y * 0.18 - rot.x) * 0.06;
    tv.rotation.set(rot.x, rot.y + Math.sin(t * 0.4) * 0.04, 0);
    tv.position.y = 0.25 + Math.sin(t * 0.8) * 0.03;
    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  resize();
  window.addEventListener("resize", resize);

  return {
    start,
    stop,
    resize,
    // Llamar cuando cambia el canvas de contenido (sube la textura a la GPU
    // solo cuando hace falta, no en cada frame).
    refresh() {
      texture.needsUpdate = true;
    },
    setPointer(x, y) {
      pointer.x = x;
      pointer.y = y;
    },
    dispose() {
      stop();
      window.removeEventListener("resize", resize);
      scene.traverse((o) => {
        o.geometry?.dispose();
        if (o.material) {
          o.material.map?.dispose();
          o.material.dispose();
        }
      });
      renderer.dispose();
    },
  };
}
