FROM node:current-alpine
WORKDIR /doodle/frontend/

COPY package.json .
RUN npm i

COPY . .
EXPOSE 8080

CMD [ "npm", "run", "dev" ]