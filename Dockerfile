FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package.json server.js ./
COPY public ./public
COPY data/.gitkeep ./data/.gitkeep

RUN addgroup -S sunyun && adduser -S sunyun -G sunyun \
  && chown -R sunyun:sunyun /app

USER sunyun

EXPOSE 8080

CMD ["node", "server.js"]
