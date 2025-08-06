FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install --production --no-fund --no-audit || true
COPY . .
CMD ["node", "src/server.js"]
