FROM node:latest
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p /app/temp
CMD ["npm", "start"]
