FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate
RUN npx tsc

EXPOSE 3001

CMD ["npm", "start"]