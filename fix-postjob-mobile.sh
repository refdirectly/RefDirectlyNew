#!/bin/bash

FILE="frontend/src/pages/PostJobPage.tsx"

# Title and description
sed -i '' 's/text-5xl font-bold/text-3xl sm:text-4xl lg:text-5xl font-bold/g' "$FILE"
sed -i '' 's/text-xl text-gray-600 max-w-2xl/text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl/g' "$FILE"

# Grid layouts
sed -i '' 's/grid md:grid-cols-3 gap-6 mb-12/grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12/g' "$FILE"
sed -i '' 's/grid md:grid-cols-2 gap-6/grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6/g' "$FILE"

# Form container
sed -i '' 's/rounded-3xl shadow-2xl p-8 md:p-12 space-y-8/rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 xl:p-12 space-y-6 sm:space-y-8/g' "$FILE"

# Headings
sed -i '' 's/text-2xl font-bold text-gray-900/text-xl sm:text-2xl font-bold text-gray-900/g' "$FILE"

# Input fields - make all responsive
sed -i '' 's/px-4 py-4 border-2/px-3 sm:px-4 py-3 sm:py-4 border-2/g' "$FILE"
sed -i '' 's/px-6 py-4 border-2/px-4 sm:px-6 py-3 sm:py-4 border-2/g' "$FILE"

# Rounded containers
sed -i '' 's/rounded-2xl p-6 border-2/rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2/g' "$FILE"

# Button text sizes
sed -i '' 's/py-5 rounded-xl font-bold text-lg/py-4 sm:py-5 rounded-xl font-bold text-base sm:text-lg/g' "$FILE"

# Flex containers
sed -i '' 's/flex items-center justify-between mb-4/flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3/g' "$FILE"
sed -i '' 's/flex items-center gap-4/flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4/g' "$FILE"

# Requirements section
sed -i '' 's/flex gap-3/flex flex-col sm:flex-row gap-2 sm:gap-3/g' "$FILE"

# Quick amount buttons
sed -i '' 's/<div className="flex gap-2">/<div className="flex gap-2 w-full sm:w-auto">/g' "$FILE"

echo "Mobile-friendly updates applied to PostJobPage.tsx"
