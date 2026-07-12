#!/bin/sh
set -eu

BASE_URL="${VITE_AUTH_BASE_URL:-https://auth.mercantec.tech}"
CLIENT_ID="${VITE_AUTH_CLIENT_ID:-demo}"
REDIRECT_URI="${VITE_AUTH_REDIRECT_URI:-}"

printf '%s\n' \
  "window.__AUTH_CONFIG__ = {" \
  "  baseUrl: \"${BASE_URL}\"," \
  "  clientId: \"${CLIENT_ID}\"," \
  "  redirectUri: \"${REDIRECT_URI}\"" \
  "};" \
  > /usr/share/nginx/html/runtime-config.js
