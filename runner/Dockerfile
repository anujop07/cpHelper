FROM gcc:13

# Install Node.js 20
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs

# Set working directory
WORKDIR /app

# Copy package files first (better Docker caching)
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy all source code
COPY . .

# Create tmp folder for code execution
RUN mkdir -p tmp

# Railway will set PORT, we expose 4000 as default
EXPOSE 4000

# Start the Express server
CMD ["npm", "start"]