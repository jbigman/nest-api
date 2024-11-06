FROM node:20.11.0-bookworm-slim

# Create the working directory!
WORKDIR /usr/app

# Copy and Install our app
COPY package.json .
RUN npm install && npm install typescript -g
COPY . .

# run typescript compiler
RUN tsc

# Fix timezone to Paris
# ENV TZ=Europe/Paris
# RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

EXPOSE 8080 

# Start me!
CMD node ./dist/main.js
