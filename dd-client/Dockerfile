FROM node:latest
WORKDIR /doodle/frontend/

COPY package.json .
RUN npm i

COPY . .

EXPOSE 5173
CMD [ "npm", "run", "dev" ]