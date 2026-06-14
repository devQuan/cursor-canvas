import * as fs from 'fs/promises';
import * as http from 'node:http';
import * as path from 'node:path';

const DEFAULT_SCAN_PORTS = [3000, 3001, 5173, 4000, 8080, 8000];

const CONFIG_FILES = [
  'vite.config.ts',
  'vite.config.js',
  'vite.config.mjs',
  'next.config.js',
  'next.config.ts',
  'next.config.mjs',
];

async function readFileIfExists(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }
}

function parsePortFromText(content: string): number | null {
  const patterns = [
    /port\s*:\s*(\d{2,5})/i,
    /--port(?:=|\s+)(\d{2,5})/i,
    /-p(?:\s+|=)(\d{2,5})/,
    /PORT=(\d{2,5})/,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match?.[1]) {
      const port = Number.parseInt(match[1], 10);
      if (port > 0 && port <= 65535) {
        return port;
      }
    }
  }

  return null;
}

export class PortDetector {
  async detect(
    workspacePath: string,
    portOverride?: number | null,
  ): Promise<{ port: number; source: 'config' | 'scan' } | null> {
    if (portOverride) {
      return { port: portOverride, source: 'config' };
    }

    const configPort = await this.detectFromConfig(workspacePath);
    if (configPort) {
      const isLive = await this.ping(configPort);
      if (isLive) {
        return { port: configPort, source: 'config' };
      }
    }

    const scannedPort = await this.scan(DEFAULT_SCAN_PORTS);
    if (scannedPort) {
      return { port: scannedPort, source: 'scan' };
    }

    if (configPort) {
      return { port: configPort, source: 'config' };
    }

    return null;
  }

  async detectFromConfig(workspacePath: string): Promise<number | null> {
    for (const fileName of CONFIG_FILES) {
      const content = await readFileIfExists(path.join(workspacePath, fileName));
      if (!content) {
        continue;
      }

      const port = parsePortFromText(content);
      if (port) {
        return port;
      }
    }

    const packageJson = await readFileIfExists(
      path.join(workspacePath, 'package.json'),
    );
    if (packageJson) {
      try {
        const pkg = JSON.parse(packageJson) as {
          scripts?: Record<string, string>;
        };
        const devScript = pkg.scripts?.dev ?? pkg.scripts?.start ?? '';
        const port = parsePortFromText(devScript);
        if (port) {
          return port;
        }
      } catch {
        return null;
      }
    }

    return null;
  }

  async scan(ports: number[]): Promise<number | null> {
    for (const port of ports) {
      if (await this.ping(port)) {
        return port;
      }
    }

    return null;
  }

  ping(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const request = http.get(
        {
          host: '127.0.0.1',
          port,
          path: '/',
          timeout: 1500,
        },
        (response) => {
          response.resume();
          resolve((response.statusCode ?? 500) < 500);
        },
      );

      request.on('error', () => resolve(false));
      request.on('timeout', () => {
        request.destroy();
        resolve(false);
      });
    });
  }

  dispose(): void {
    // stateless service
  }
}
