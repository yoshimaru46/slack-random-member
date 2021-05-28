FROM node:14-slim

# Install app dependencies.
COPY package.json /src/package.json
WORKDIR /src
RUN yarn

# Bundle app source.
COPY app.js gcpUtils.js datastore.js shuffle.js /src/

CMD ["node", "--es-module-specifier-resolution=node", "app.js"]
