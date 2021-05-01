FROM node:12-slim

# Install app dependencies.
COPY package.json /src/package.json
WORKDIR /src
RUN yarn

# Bundle app source.
COPY app.js /src

CMD ["node", "app.js"]
