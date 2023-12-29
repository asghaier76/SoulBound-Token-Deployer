# BUILD LOCAL 

FROM node:18-alpine As development

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

COPY --chown=node:node prisma ./prisma/

RUN npm ci

COPY --chown=node:node . .

USER node

# BUILD PRODUCTION

FROM node:18-alpine As build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

COPY --chown=node:node prisma ./prisma/

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN npm run build

ENV NODE_ENV production

RUN npm ci --only=production && npm cache clean --force

USER node


# CREATE PRODUCTION

FROM node:18-alpine As production

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/prisma ./prisma
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

EXPOSE 3000
CMD [  "npm", "run", "start:migrate:prod" ]
