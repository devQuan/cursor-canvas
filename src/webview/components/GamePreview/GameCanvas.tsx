import React, { useEffect, useRef } from 'react';
import type { GameEngine, SceneObject } from '../../../types';
import { useCanvasStore } from '../../store/canvasStore';

const ENGINE_LABELS: Record<GameEngine, string> = {
  'unity-webgl': 'Unity WebGL',
  unity: 'Unity',
  'godot-webgl': 'Godot Web',
  godot: 'Godot',
  threejs: 'Three.js',
  'generic-iframe': 'Game Server',
};

const SETUP_MESSAGES: Partial<Record<GameEngine, string>> = {
  unity:
    'Unity project detected. Build for WebGL, set cursorCanvas.unityWebGlPath, or run a local game server on a detected port.',
  godot:
    'Godot project detected. Export a Web build or run a local game server on a detected port.',
  'generic-iframe':
    'Start your game server to preview it here. Canvas will load localhost when a port is detected.',
};

function buildObjectMesh(
  THREE: typeof import('three'),
  object: SceneObject,
  index: number,
): import('three').Object3D {
  let mesh: import('three').Object3D;

  switch (object.type) {
    case 'light':
      mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24 }),
      );
      break;
    case 'camera':
      mesh = new THREE.Mesh(
        new THREE.ConeGeometry(0.22, 0.5, 4),
        new THREE.MeshStandardMaterial({ color: 0xa78bfa }),
      );
      mesh.rotation.x = Math.PI;
      break;
    case 'group':
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.35, 0.35),
        new THREE.MeshStandardMaterial({
          color: 0x34d399,
          wireframe: true,
        }),
      );
      break;
    default:
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.55, 0.55),
        new THREE.MeshStandardMaterial({
          color: 0x7c6af7,
          metalness: 0.35,
          roughness: 0.4,
        }),
      );
      break;
  }

  const column = index % 4;
  const row = Math.floor(index / 4);
  mesh.position.set(column * 1.4 - 2.1, 0, row * -1.4);
  mesh.visible = object.visible;
  return mesh;
}

const GameCanvas = React.memo(() => {
  const engine = useCanvasStore((state) => state.engine);
  const sceneObjects = useCanvasStore((state) => state.sceneObjects);
  const gamePreviewUrl = useCanvasStore((state) => state.gamePreviewUrl);
  const gamePreviewStatus = useCanvasStore((state) => state.gamePreviewStatus);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (engine !== 'threejs' || !containerRef.current) {
      return;
    }

    let mounted = true;
    let animationId = 0;
    let renderer: import('three').WebGLRenderer | null = null;
    let observer: ResizeObserver | null = null;

    void import('three').then((THREE) => {
      if (!mounted || !containerRef.current) {
        return;
      }

      const container = containerRef.current;
      const width = container.clientWidth || 640;
      const height = container.clientHeight || 480;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0f0f12);
      scene.fog = new THREE.Fog(0x0f0f12, 8, 18);

      const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 100);
      camera.position.set(0, 3.2, 6.2);
      camera.lookAt(0, 0.4, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
      container.replaceChildren(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 0.45));
      const directional = new THREE.DirectionalLight(0xffffff, 1.2);
      directional.position.set(4, 8, 5);
      scene.add(directional);

      const accentLight = new THREE.PointLight(0x7c6af7, 1.4, 20);
      accentLight.position.set(-3, 2, 2);
      scene.add(accentLight);

      const root = new THREE.Group();
      scene.add(root);

      const floor = new THREE.Mesh(
        new THREE.CircleGeometry(5.5, 64),
        new THREE.MeshStandardMaterial({
          color: 0x18181f,
          metalness: 0.2,
          roughness: 0.85,
        }),
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -0.01;
      root.add(floor);

      const grid = new THREE.GridHelper(10, 20, 0x7c6af7, 0x2a2a35);
      grid.position.y = 0.01;
      root.add(grid);

      if (sceneObjects.length === 0) {
        root.add(
          new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshStandardMaterial({
              color: 0x7c6af7,
              wireframe: true,
            }),
          ),
        );
      } else {
        sceneObjects.forEach((object, index) => {
          root.add(buildObjectMesh(THREE, object, index));
        });
      }

      const animate = (): void => {
        root.rotation.y += 0.005;
        renderer?.render(scene, camera);
        animationId = window.requestAnimationFrame(animate);
      };

      animate();

      observer = new ResizeObserver(() => {
        const nextWidth = container.clientWidth || width;
        const nextHeight = container.clientHeight || height;
        camera.aspect = nextWidth / nextHeight;
        camera.updateProjectionMatrix();
        renderer?.setSize(nextWidth, nextHeight);
      });
      observer.observe(container);
    });

    return () => {
      mounted = false;
      window.cancelAnimationFrame(animationId);
      observer?.disconnect();
      renderer?.dispose();
    };
  }, [engine, sceneObjects]);

  const showThreeCanvas = engine === 'threejs';
  const showIframe = !showThreeCanvas && Boolean(gamePreviewUrl);
  const setupMessage = SETUP_MESSAGES[engine];

  const isLoading =
    gamePreviewStatus === 'loading' ||
    (showThreeCanvas &&
      sceneObjects.length === 0 &&
      gamePreviewStatus !== 'ready');

  const showSetupState =
    !showIframe &&
    !isLoading &&
    gamePreviewStatus !== 'error' &&
    Boolean(setupMessage) &&
    !showThreeCanvas;

  return (
    <div className="relative h-full min-w-0 bg-canvas-bg">
      <div className="absolute left-3 top-3 z-10 rounded bg-canvas-surface/90 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-canvas-muted">
        {ENGINE_LABELS[engine]}
      </div>

      {showIframe ? (
        <iframe
          title="Game preview"
          src={gamePreviewUrl ?? undefined}
          className="h-full w-full border-0 bg-black"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      ) : (
        <div
          ref={containerRef}
          className={[
            'h-full w-full',
            showThreeCanvas && isLoading
              ? 'animate-pulse border border-dashed border-canvas-accent/40'
              : '',
          ].join(' ')}
        />
      )}

      {isLoading && showThreeCanvas ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="rounded bg-canvas-surface/90 px-3 py-2 text-sm text-canvas-muted">
            Waiting for scene graph…
          </p>
        </div>
      ) : null}

      {showSetupState ? (
        <div className="absolute inset-0 flex items-center justify-center bg-canvas-bg/90 p-6 text-center">
          <p className="max-w-md text-sm leading-relaxed text-canvas-text">
            {setupMessage}
          </p>
        </div>
      ) : null}

      {gamePreviewStatus === 'error' ? (
        <div className="absolute inset-0 flex items-center justify-center bg-canvas-bg/90 p-6 text-center">
          <p className="text-sm text-canvas-text">
            Game preview unavailable. Check your workspace and settings.
          </p>
        </div>
      ) : null}
    </div>
  );
});

GameCanvas.displayName = 'GameCanvas';

export default GameCanvas;
