type Supertest = typeof import('supertest');

// supertest exposes a CommonJS `export =` function, so default import is not callable at runtime here.
// eslint-disable-next-line @typescript-eslint/no-require-imports
export const request = require('supertest') as Supertest;
