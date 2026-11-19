FROM ghcr.io/sd87671067/go-emby@sha256:84a053e99fd7d5fb0f2793682a3e68f4bb2150d9088abe84c297302d03740d21 AS upstream

FROM node:22-bookworm-slim AS patch
WORKDIR /patch
COPY runtime-patches/package.json runtime-patches/pnpm-lock.yaml ./
RUN npm install --global pnpm@11.25.0 && pnpm install --prod --frozen-lockfile --ignore-scripts
COPY runtime-patches/ ./
COPY --from=upstream /usr/local/bin/go-emby /patch/upstream-binary
RUN node build.mjs /patch/upstream-binary /patch/patched-binary

FROM upstream AS runtime
ARG SOURCE_REVISION=unknown
LABEL org.opencontainers.image.title="go-emby2" \
      org.opencontainers.image.source="https://github.com/xhui999w/go-emby2" \
      org.opencontainers.image.revision=$SOURCE_REVISION \
      org.opencontainers.image.description="Pinned Go-Emby runtime with maintained directory import fixes"
COPY --from=patch --chmod=0755 /patch/patched-binary /usr/local/bin/go-emby
