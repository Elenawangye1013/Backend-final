FROM node:20

# Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
