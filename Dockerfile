FROM node:10.15.1
EXPOSE 8080
COPY . /
WORKDIR /
RUN npm install
RUN npm install express --save
RUN npm install auth --save
RUN npm install cookie-parser --save
CMD ["npm","start"]