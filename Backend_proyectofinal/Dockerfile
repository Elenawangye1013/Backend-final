FROM node:20

# Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

COPY Backend_proyectofinal/package.json ./
COPY Backend_proyectofinal/package-lock.json ./

RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
 
