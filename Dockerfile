# Stage 1 - build and test
FROM node:14 AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . ./

# Run tests, fail build if tests fail
RUN npm test

# Stage 2 - production image
FROM node:14-alpine

WORKDIR /usr/src/app

# Copy only the production node_modules and app files from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app ./

EXPOSE 8080

CMD ["npm", "run-script", "start"]
