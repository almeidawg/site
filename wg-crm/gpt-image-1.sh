#!/bin/bash

# OpenAI GPT-Image-1 (DALL-E 3) Image Generation Script
# Usage: ./gpt-image-1.sh "prompt" [size] [quality]
# Sizes: 1024x1024 (default), 1792x1024, 1024x1792
# Quality: standard (default), hd

set -e

# Check for required parameters
if [ -z "$1" ]; then
    echo "Error: Prompt is required"
    echo "Usage: $0 \"prompt\" [size] [quality]"
    exit 1
fi

PROMPT="$1"
SIZE="${2:-1024x1024}"
QUALITY="${3:-standard}"

# Validate size
if [[ ! "$SIZE" =~ ^(1024x1024|1792x1024|1024x1792)$ ]]; then
    echo "Error: Invalid size. Must be 1024x1024, 1792x1024, or 1024x1792"
    exit 1
fi

# Validate quality
if [[ ! "$QUALITY" =~ ^(standard|hd)$ ]]; then
    echo "Error: Invalid quality. Must be 'standard' or 'hd'"
    exit 1
fi

# Check for API key
if [ -z "$OPENAI_API_KEY" ]; then
    echo "Error: OPENAI_API_KEY environment variable is not set"
    exit 1
fi

# Create output directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="$SCRIPT_DIR/generated-images"
mkdir -p "$OUTPUT_DIR"

# Generate timestamp for filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="generated_${TIMESTAMP}.png"
OUTPUT_PATH="$OUTPUT_DIR/$FILENAME"

echo "Generating image with GPT-Image-1..."
echo "Prompt: $PROMPT"
echo "Size: $SIZE"
echo "Quality: $QUALITY"
echo ""

# Make API request
RESPONSE=$(curl -s https://api.openai.com/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d "{
    \"model\": \"dall-e-3\",
    \"prompt\": \"$PROMPT\",
    \"n\": 1,
    \"size\": \"$SIZE\",
    \"quality\": \"$QUALITY\",
    \"response_format\": \"b64_json\"
  }")

# Check for errors
if echo "$RESPONSE" | grep -q '"error"'; then
    echo "Error from OpenAI API:"
    echo "$RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4
    exit 1
fi

# Extract base64 data
B64_DATA=$(echo "$RESPONSE" | grep -o '"b64_json":"[^"]*"' | cut -d'"' -f4)

if [ -z "$B64_DATA" ]; then
    echo "Error: No image data received from API"
    echo "Response: $RESPONSE"
    exit 1
fi

# Decode and save image
echo "$B64_DATA" | base64 -d > "$OUTPUT_PATH"

# Verify file was created
if [ -f "$OUTPUT_PATH" ]; then
    FILE_SIZE=$(ls -lh "$OUTPUT_PATH" | awk '{print $5}')
    echo "Success! Image generated and saved."
    echo "File: $OUTPUT_PATH"
    echo "Size: $FILE_SIZE"
    echo ""
    echo "PATH:$OUTPUT_PATH"
else
    echo "Error: Failed to save image"
    exit 1
fi
