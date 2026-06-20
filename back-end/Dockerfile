FROM node:24

RUN apt-get update && apt-get install -y git

WORKDIR /app
COPY package.json yarn.lock ./ 
RUN yarn

COPY . . 
EXPOSE 8000

ENTRYPOINT [ "yarn", "dev" ]