#!/bin/bash
# Simple script to help track conversion progress
find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v ".next" | grep -v "next-env.d.ts" | while read file; do
  if [ -f "$file" ]; then
    echo "Still needs conversion: $file"
  fi
done
