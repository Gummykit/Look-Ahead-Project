#!/bin/bash

# Build the web version
echo "Building web version..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
  echo "Build failed!"
  exit 1
fi

echo "Web build completed successfully!"
echo "App is ready for deployment"
