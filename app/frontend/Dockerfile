# ==========================================
# Hardened, Lightweight Frontend Image (Nginx Alpine)
# ==========================================
FROM nginx:1.27-alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy custom reverse-proxy and security header configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static frontend assets into standard Nginx webroot
COPY public/ /usr/share/nginx/html/

# Expose HTTP port
EXPOSE 80

# Healthcheck to verify Nginx is actively responding
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
