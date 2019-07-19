FROM node:10.15.1
EXPOSE 8080
COPY . /
WORKDIR /
RUN npm install
CMD ["npm","start"]