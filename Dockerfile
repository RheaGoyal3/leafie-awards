# Use node 4.4.5 LTS
FROM node:4.4.5
EXPOSE 8080
COPY . /
WORKDIR /
RUN npm install
CMD ["npm","start"]