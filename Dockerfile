# Stage: deps - install once, shared by the reports and builder stages below via Docker's
# build cache (both extend this same base, so `npm install`/`COPY . ./` only run once per
# build as long as the context is unchanged).
FROM node:20 AS deps

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --include=dev

COPY . ./

# Stage: reports - generates machine-readable quality reports (lint, duplicate-code,
# coverage) WITHOUT ever failing the build. This stage exists specifically so its reports
# can still be extracted and archived by CI even when the `builder` stage below fails a
# real gate - a failed `docker build` produces no image to `docker cp` from, so report
# generation has to live in its own always-succeeding stage, built and archived first.
FROM deps AS reports

RUN npm run lint:report
RUN npm run dupes:report
RUN npm run test:coverage || true

# Stage: builder - the real quality gates. Each step fails the build on a genuine
# violation, mirroring `npm run check` locally. Runs after the `reports` stage in CI
# (see Jenkinsfile) so a failure here still leaves a report behind to explain why.
FROM deps AS builder

RUN npm run lint
RUN npm run typecheck
RUN npm run knip
RUN npm run dupes
RUN npm run test:ci:coverage

# Compile TypeScript to dist/ - the production image runs the compiled output directly,
# it does not have (or need) the TypeScript toolchain.
RUN npm run build

# Stage: production image
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy only the production node_modules and app files from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app ./

EXPOSE 8080

CMD ["node", "dist/index.js"]
