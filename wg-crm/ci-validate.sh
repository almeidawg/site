#!/usr/bin/env bash
set -euo pipefail

echo "🚧 Running lint"
npm run lint

echo "🧪 Running tests"
npm run test

echo "✅ CI validation completed successfully"
