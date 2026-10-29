# CIS 4150 Testing Framework

This testing framework uses the native Node.js test runner (`node:test`, `node:assert/strict`) and TypeScript (`tsx`) to support both **Unit Testing** (via Express request/response/next mocking) and **Integration/API Testing** (via `supertest` with in-memory database).

---

## Directory Structure

```
test_4150/
├── helpers/
│   ├── express.mock.ts     # Mock Request, Response, NextFunction with node:test mock.fn
│   ├── setup.ts            # App initialization, DB reset, and authentication helpers
│   ├── test-env.mjs        # Sets NODE_ENV = 'test'
│   └── index.ts            # Unified helper exports
│
├── graph/                  # Graph-based coverage (Control Flow Graph: Node, Edge, Prime Path)
│   └── routes/
│       └── example.test.ts 
│
├── isp/                    # Input Space Partitioning (Characteristics, Blocks, Base Choice)
│   └── routes/
│       └── example.test.ts 
└── README.md
```

---

## Running Tests

The framework integrates directly with `package.json` scripts:

```bash
# Run all CIS 4150 tests
npm run test:4150

# Run only unit tests
npm run test:4150:unit

# Run only Graph Coverage tests
npm run test:4150:graph

# Run only Input Space Partitioning (ISP) tests
npm run test:4150:isp

# Run test coverage with NYC
npm run test:4150:coverage
```

You can also run any specific test file directly:
```bash
node --import ./test_4150/helpers/test-env.mjs --import tsx --test --test-force-exit "test_4150/graph/routes/example.test.ts"
```