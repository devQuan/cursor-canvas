import * as esbuild from 'esbuild';
import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const isWatch = process.argv.includes('--watch');

/** @type {import('esbuild').BuildOptions} */
const extensionConfig = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  external: ['vscode'],
  outfile: 'dist/extension.js',
  format: 'cjs',
  sourcemap: true,
};

/** @type {import('esbuild').BuildOptions} */
const webviewConfig = {
  entryPoints: ['src/webview/index.tsx'],
  bundle: true,
  platform: 'browser',
  target: ['es2020'],
  outfile: 'dist/webview.js',
  format: 'iife',
  sourcemap: true,
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(
      isWatch ? 'development' : 'production',
    ),
  },
};

function buildTailwindCss() {
  mkdirSync('dist', { recursive: true });
  execSync(
    'npx tailwindcss -i src/webview/styles/globals.css -o dist/webview.css --minify',
    { stdio: 'inherit' },
  );
}

async function buildOnce() {
  await esbuild.build(extensionConfig);
  await esbuild.build(webviewConfig);
  buildTailwindCss();
  console.log('Build complete.');
}

async function watch() {
  buildTailwindCss();
  const extensionContext = await esbuild.context(extensionConfig);
  const webviewContext = await esbuild.context(webviewConfig);

  await extensionContext.watch();
  await webviewContext.watch();

  console.log('Watching for changes...');
}

if (isWatch) {
  await watch();
} else {
  await buildOnce();
}
