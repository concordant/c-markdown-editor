## Private release

The C-Markdown-Editor, and the Concordant stack it depends on,
are delivered as NPM packages.
Public releases are published on [npmjs](https://www.npmjs.com/),
while development releases are published
to a private [Gitlab Packages registry](https://gitlab.inria.fr/concordant/software/c-markdown-editor/-/packages).

To use development releases, set up NPM
as described in the [c-crdtlib guide](https://gitlab.inria.fr/concordant/software/c-crdtlib/-/blob/master/README.dev.md#javascripttypescript-and-npm)

## Build

The build is managed by NPM.
Typescript sources (code and tests) are transpiled to JavaScript.
NPM targets (set up as scripts in `package.json`) are as follows:

- `install`: install dependencies and prepare
- `run prepare`: transpile to JS (lifecycle script)
- `start`: dev server, listens on TCP port 3000
- `run build`: build the demo application for production
- `test`: run tests

## Files

### Build, configuration, metadata

- `LICENSE`
- `README.md` Doc: user
- `README.dev.md` Doc: developer
- `.git/` Config: Git
- `.gitignore`
- `package.json` Config: NPM: metadata, dependencies, scripts,
  config (eslint)
- `package-lock.json` Actual dependency tree (automatically updated)
- `tsconfig.json` Config: tsc TypeScript compiler:  
   `src → dist/`

### Code

- `src/` Code
  - `index.tsx` demo application
- `public/` web skeleton & resources for demo application

### Artifacts (untracked)

- `node_modules/` Dependencies,
  created & populated by `npm install`
- `dist/` JS files,
  created & populated by the `prepare` script (tsc)
- `build/` demo application production build,
  created & populated by `npm run build`
