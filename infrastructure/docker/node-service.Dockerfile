FROM node:24.18.0-bookworm-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

WORKDIR /workspace

RUN corepack enable \
    && corepack prepare pnpm@11.9.0 --activate \
    && mkdir -p /pnpm \
    && chown -R node:node /pnpm

COPY . .

RUN pnpm install --frozen-lockfile \
    && chown -R node:node /workspace /pnpm

USER node

CMD ["node", "-e", "setInterval(() => {}, 2147483647)"]