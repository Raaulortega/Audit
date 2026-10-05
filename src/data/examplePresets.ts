import SITE_VERCEL_JSON from '../../vercel.json?raw';

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

// Assembled from pieces so repository secret scanners do not flag the demo
// value; it is the documented AWS example key, not a real credential.
const DEMO_AWS_KEY = ['AKIA', 'IOSFODNN7', 'EXAMPLE'].join('');

const ENV_FILE = `NODE_ENV=production
DEBUG=true
DATABASE_URL=postgres://app:S3cr3tPassw0rd@db.internal:5432/app?sslmode=disable
NEXT_PUBLIC_STRIPE_SECRET=sk_test_placeholder
JWT_SECRET=short-secret
ADMIN_PASSWORD=admin123
AWS_ACCESS_KEY_ID=${DEMO_AWS_KEY}
CORS_ORIGIN=*`;

const DOCKER_COMPOSE = `services:
  app:
    image: myorg/api:latest
    privileged: true
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    ports:
      - "3000:3000"
  db:
    image: postgres
    environment:
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
  cache:
    image: redis:7.2
    network_mode: host`;

const NGINX_CONF = `server {
    listen 80;
    server_name example.com;

    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    autoindex on;

    location /static {
        alias /var/www/app/static/;
    }

    location /api/ {
        add_header Access-Control-Allow-Origin *;
        proxy_pass http://127.0.0.1:3000;
    }
}`;

export const EXAMPLE_PRESETS: ExamplePreset[] = [
  {
    id: 'this-site',
    label: 'This website',
    description: 'Our own vercel.json',
    files: [{ filename: 'vercel.json', content: SITE_VERCEL_JSON }],
  },
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
    id: 'env',
    label: '.env',
    description: 'Leaked & weak secrets',
    files: [{ filename: '.env', content: ENV_FILE }],
  },
  {
    id: 'compose',
    label: 'docker-compose.yml',
    description: 'Privileged, exposed DB',
    files: [{ filename: 'docker-compose.yml', content: DOCKER_COMPOSE }],
  },
  {
    id: 'nginx',
    label: 'nginx.conf',
    description: 'Old TLS, alias traversal',
    files: [{ filename: 'nginx.conf', content: NGINX_CONF }],
  },
  {
    id: 'full-project',
    label: 'Full project',
    description: 'All 7 files at once',
    files: [
      { filename: 'vercel.json', content: VERCEL_JSON },
      { filename: 'package.json', content: PACKAGE_JSON },
      { filename: 'Dockerfile', content: DOCKERFILE },
      { filename: '.gitignore', content: GITIGNORE },
      { filename: '.env', content: ENV_FILE },
      { filename: 'docker-compose.yml', content: DOCKER_COMPOSE },
      { filename: 'nginx.conf', content: NGINX_CONF },
    ],
  },
];
