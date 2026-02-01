# Use nginx to serve the pre-built frontend
FROM nginx:alpine

# Copy pre-built assets (built locally to avoid Docker build issues)
COPY dist /usr/share/nginx/html

# Copy nginx configuration (optional, for custom routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
