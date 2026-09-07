export interface PresetFile {
  filename: string;
  content: string;
}

export interface ExamplePreset {
  id: string;
  label: string;
  description: string;
  files: PresetFile[];
}

const VERCEL_JSON = `{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Powered-By", "value": "Express" }
      ]
    }
  ]
}`;

const PACKAGE_JSON = `{
  "name": "legacy-dashboard",
  "version": "2.4.1",
  "dependencies": {
    "axios": "1.0.0",
    "nodemon": "3.0.0"
  },
  "devDependencies": {},
  "scripts": {
    "start": "node server.js"
  }
}`;

const DOCKERFILE = `FROM node:latest
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]`;

const GITIGNORE = `dist/
*.log`;

export const EXAMPLE_PRESETS: ExamplePreset[] = [
  {
    id: 'vercel',
    label: 'vercel.json',
    description: 'Missing security headers',
    files: [{ filename: 'vercel.json', content: VERCEL_JSON }],
  },
  {
    id: 'package',
    label: 'package.json',
    description: 'Vulnerable dependency',
    files: [{ filename: 'package.json', content: PACKAGE_JSON }],
  },
  {
    id: 'dockerfile',
    label: 'Dockerfile',
    description: 'Root user, unpinned tag',
    files: [{ filename: 'Dockerfile', content: DOCKERFILE }],
  },
  {
    id: 'gitignore',
    label: '.gitignore',
    description: 'Secrets not excluded',
    files: [{ filename: '.gitignore', content: GITIGNORE }],
  },
  {
    id: 'full-project',
    label: 'Full project',
    description: 'All 4 files at once',
    files: [
      { filename: 'vercel.json', content: VERCEL_JSON },
      { filename: 'package.json', content: PACKAGE_JSON },
      { filename: 'Dockerfile', content: DOCKERFILE },
      { filename: '.gitignore', content: GITIGNORE },
    ],
  },
];
