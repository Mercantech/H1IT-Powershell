// Produktion: overskrives ved container-start (docker/99-runtime-config.sh).
// Lokal dev: tom — Vite læser i stedet VITE_* fra .env.
window.__AUTH_CONFIG__ = window.__AUTH_CONFIG__ || {};
