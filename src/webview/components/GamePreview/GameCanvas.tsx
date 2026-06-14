import React, { useEffect, useRef } from 'react';
import type { SceneObject } from '../../../types';
import { useCanvasStore } from '../../store/canvasStore';

const ENGINE_LABELS = {
  threejs: 'Three.js',
  'unity-webgl': 'Unity WebGL',
  'generic-iframe': 'Game Server',
} as const;

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
        new THREE.MeshStandardMaterial({ color: 0x38bdf8 }),
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
      scene.background = new THREE.Color(0x111111);

      const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
      camera.position.set(0, 2.8, 5.5);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
      container.replaceChildren(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 0.55));
      const directional = new THREE.DirectionalLight(0xffffff, 1.1);
      directional.position.set(4, 6, 5);
      scene.add(directional);

      const root = new THREE.Group();
      scene.add(root);

      const grid = new THREE.GridHelper(8, 8, 0x333333, 0x222222);
      root.add(grid);

      if (sceneObjects.length === 0) {
        root.add(
          new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshStandardMaterial({
              color: 0x007acc,
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

  const showIframe =
    (engine === 'unity-webgl' || engine === 'generic-iframe') &&
    gamePreviewUrl;

  const isLoading =
    gamePreviewStatus === 'loading' ||
    (engine === 'threejs' && sceneObjects.length === 0);

  return (
    <div className="relative h-full min-w-0 bg-canvas-bg">
      <div className="absolute left-3 top-3 z-10 rounded bg-canvas-surface/90 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-canvas-muted">
        {ENGINE_LABELS[engine]}
      </div>

      {showIframe ? (
        <iframe
          title="Game preview"
          src={gamePreviewUrl}
          className="h-full w-full border-0 bg-black"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      ) : (
        <div
          ref={containerRef}
          className={[
            'h-full w-full',
            isLoading ? 'animate-pulse border border-dashed border-canvas-accent/40' : '',
          ].join(' ')}
        />
      )}

      {isLoading && !showIframe ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="rounded bg-canvas-surface/90 px-3 py-2 text-sm text-canvas-muted">
            Waiting for game output…
          </p>
        </div>
      ) : null}

      {gamePreviewStatus === 'error' ? (
        <div className="absolute inset-0 flex items-center justify-center bg-canvas-bg/90 p-6 text-center">
          <p className="text-sm text-canvas-text">
            Engine not detected. Check your workspace.
          </p>
        </div>
      ) : null}
    </div>
  );
});

GameCanvas.displayName = 'GameCanvas';

export default GameCanvas;
