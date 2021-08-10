FROM node:14.17.4-alpine

#copia la carpeta actual a /usr/src/
COPY ["package.json","package-lock.json", "/usr/src/"]

# establece el directorio de trabajo (cd /usr/src/)
WORKDIR /usr/src

RUN npm install

EXPOSE 3000

COPY [".", "/usr/src/"]

# ejecuta el commando 
CMD ["npx", "nodemon", "index.js"]
