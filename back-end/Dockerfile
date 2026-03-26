FROM node:25

WORKDIR /app
COPY package.json yarn.lock ./ 
RUN yarn

COPY . . 
EXPOSE 8000

ENTRYPOINT [ "yarn", "dev" ]