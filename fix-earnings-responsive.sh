#!/bin/bash

FILE="frontend/src/pages/ReferrerEarningsPage.tsx"

# Header section
sed -i '' 's/flex justify-between items-center mb-8/flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4/g' "$FILE"
sed -i '' 's/text-4xl font-bold/text-3xl sm:text-4xl lg:text-5xl font-bold/g' "$FILE"
sed -i '' 's/text-gray-600\">Track your/text-sm sm:text-base text-gray-600\">Track your/g' "$FILE"

# Export button
sed -i '' 's/px-6 py-3 rounded-xl/px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base/g' "$FILE"

# Stats grid
sed -i '' 's/grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12/grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12/g' "$FILE"
sed -i '' 's/rounded-2xl p-6/rounded-xl sm:rounded-2xl p-4 sm:p-6/g' "$FILE"
sed -i '' 's/text-3xl font-bold/text-2xl sm:text-3xl font-bold/g' "$FILE"

# Main grid
sed -i '' 's/grid lg:grid-cols-3 gap-8 mb-12/grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12/g' "$FILE"

# Transaction history card
sed -i '' 's/rounded-2xl p-8/rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8/g' "$FILE"
sed -i '' 's/text-2xl font-bold/text-xl sm:text-2xl font-bold/g' "$FILE"

# Search and filter
sed -i '' 's/flex items-center gap-3/flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto/g' "$FILE"
sed -i '' 's/pl-10 pr-4 py-2/w-full sm:w-auto pl-10 pr-4 py-2/g' "$FILE"
sed -i '' 's/px-4 py-2 border/w-full sm:w-auto px-4 py-2 border/g' "$FILE"

# Table responsive
sed -i '' 's/<div className=\"overflow-x-auto\">/<div className=\"overflow-x-auto -mx-4 sm:mx-0\">/g' "$FILE"
sed -i '' 's/text-left py-3 px-4/text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm/g' "$FILE"
sed -i '' 's/text-right py-3 px-4/text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm/g' "$FILE"
sed -i '' 's/text-center py-3 px-4/text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm/g' "$FILE"
sed -i '' 's/py-4 px-4/py-3 px-2 sm:py-4 sm:px-4/g' "$FILE"

# Sidebar cards
sed -i '' 's/text-lg font-bold/text-base sm:text-lg font-bold/g' "$FILE"
sed -i '' 's/text-xl font-bold/text-lg sm:text-xl font-bold/g' "$FILE"
sed -i '' 's/text-sm font-medium/text-xs sm:text-sm font-medium/g' "$FILE"

echo "Responsive fixes applied to ReferrerEarningsPage.tsx"
