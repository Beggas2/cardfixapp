# Use the official Encore.ts image
FROM encoredev/encore:latest

# Set working directory
WORKDIR /app

# Copy the entire project
COPY . .

# Install dependencies and build
RUN encore build

# Expose the port
EXPOSE 4000

# Start the application
CMD ["encore", "run", "--listen=0.0.0.0:4000"]
