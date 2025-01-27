FROM node:18-alpine

WORKDIR /app

# Copy package files directly since we're in the frontend context
COPY package*.json yarn.lock ./
RUN yarn install

# Copy the rest of the frontend application
COPY . .

EXPOSE 3000

# Add this environment variable to allow connections from any host
ENV HOST=0.0.0.0

CMD ["yarn", "start"]