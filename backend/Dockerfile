FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN chmod +x ./node_modules/.bin/prisma && ./node_modules/.bin/prisma generate
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]