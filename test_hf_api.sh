#!/bin/bash

# Load environment variables from .env file
source .env

echo "Testing Hugging Face API connection..."

# Using a known working model for testing with the correct endpoint
MODEL_ID="microsoft/DialoGPT-medium"
API_URL="https://api-inference.huggingface.co/models/$MODEL_ID"

# Test payload
PAYLOAD='{
    "inputs": "Hello, how are you?",
    "parameters": {
        "max_length": 50,
        "temperature": 0.7
    }
}'

echo "Sending request to: $API_URL"
curl -X POST \
    "$API_URL" \
    -H "Authorization: Bearer $HF_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD" \
    -v

echo ""
echo "----------------------------------------"
echo ""

# If the above doesn't work, let's try a different model
echo "Trying with a different model..."
MODEL_ID="gpt2"
API_URL="https://api-inference.huggingface.co/models/$MODEL_ID"

echo "Sending request to: $API_URL"
curl -X POST \
    "$API_URL" \
    -H "Authorization: Bearer $HF_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD" \
    -v

echo ""
echo "----------------------------------------"
echo ""

# Also try with Google API if available - using the correct model name
echo "Testing Google API connection..."
if [ ! -z "$AI_API_KEY" ]; then
    echo "Using Google API with key: ${AI_API_KEY:0:10}..."

    # Prepare the request for Google Generative AI - using gemini-pro as specified in the env
    GOOGLE_PAYLOAD='{
        "contents": [{
            "parts": [{
                "text": "Hello, how are you?"
            }]
        }],
        "generationConfig": {
            "maxOutputTokens": 100,
            "temperature": 0.7
        }
    }'

    # Use the model ID from the environment variable
    MODEL_ID="${NEXT_PUBLIC_OPENROUTER_MODEL_ID:-gemini-2.5-flash}"
    GOOGLE_API_URL="https://generativelanguage.googleapis.com/v1beta/models/$MODEL_ID:generateContent?key=$AI_API_KEY"

    echo "Sending request to: $GOOGLE_API_URL"
    curl -X POST \
        "$GOOGLE_API_URL" \
        -H "Content-Type: application/json" \
        -d "$GOOGLE_PAYLOAD" \
        -v
else
    echo "Google API key not found in environment"
fi

echo ""
echo "----------------------------------------"
echo ""

# Also try with Ollama if available
echo "Testing Ollama API connection..."
if [ ! -z "$OLLAMA_BASE_URL" ] && [ ! -z "$OLLAMA_MODEL_ID" ]; then
    echo "Using Ollama API at: $OLLAMA_BASE_URL with model: $OLLAMA_MODEL_ID"

    # Check if the Ollama server is reachable first
    if curl -s --connect-timeout 5 "$OLLAMA_BASE_URL/version" > /dev/null; then
        echo "Ollama server is reachable"

        OLLAMA_PAYLOAD='{
            "model": "'"$OLLAMA_MODEL_ID"'",
            "messages": [
                {
                    "role": "user",
                    "content": "Hello, how are you?"
                }
            ],
            "stream": false,
            "options": {
                "temperature": 0.7
            }
        }'

        echo "Sending request to: $OLLAMA_BASE_URL/chat"
        curl -X POST \
            "$OLLAMA_BASE_URL/chat" \
            -H "Content-Type: application/json" \
            -d "$OLLAMA_PAYLOAD" \
            -v
    else
        echo "Ollama server is not reachable at $OLLAMA_BASE_URL"
    fi
else
    echo "Ollama configuration not found in environment"
fi

echo ""
echo "----------------------------------------"
echo ""

# Try with OpenRouter as well since it's mentioned in the config
echo "Testing OpenRouter API connection..."
if [ ! -z "$NEXT_PUBLIC_OPENROUTER_API_KEY" ]; then
    echo "Using OpenRouter API with key: ${NEXT_PUBLIC_OPENROUTER_API_KEY:0:10}..."

    OPENROUTER_PAYLOAD='{
        "model": "'"${NEXT_PUBLIC_OPENROUTER_MODEL_ID:-gemini-2.5-flash}"'",
        "messages": [
            {
                "role": "user",
                "content": "Hello, how are you?"
            }
        ]
    }'

    OPENROUTER_API_URL="https://openrouter.ai/api/v1/chat/completions"

    echo "Sending request to: $OPENROUTER_API_URL"
    curl -X POST \
        "$OPENROUTER_API_URL" \
        -H "Authorization: Bearer $NEXT_PUBLIC_OPENROUTER_API_KEY" \
        -H "Content-Type: application/json" \
        -d "$OPENROUTER_PAYLOAD" \
        -v
else
    echo "OpenRouter API key not found in environment"
fi