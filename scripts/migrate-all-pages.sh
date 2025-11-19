#!/bin/bash
# Bulk convert Next.js pages to React Router pages

echo "🔄 Starting bulk page migration..."

# Find all page.tsx files
find src/app -name "page.tsx" -type f | while read -r file; do
  echo "Converting: $file"
  
  # Extract page name and create pages directory structure
  # e.g., src/app/login/page.tsx -> src/pages/LoginPage.tsx
  dir=$(dirname "$file")
  page_name=$(basename "$dir")
  
  # Convert page name to PascalCase
  page_name_pascal=$(echo "$page_name" | sed 's/\b\(.\)/\u\1/g' | sed 's/-\(.\)/\u\1/g')
  
  # Handle dynamic routes: transactions/[id] -> TransactionDetailsPage
  if [[ "$dir" == *"/["* ]]; then
    parent_dir=$(dirname "$dir")
    parent_name=$(basename "$parent_dir")
    param_name=$(basename "$dir" | tr -d '[]')
    page_name_pascal="${parent_name}${param_name^}Page"
  fi
  
  # Create output file path
  output_file="src/pages/${page_name_pascal}Page.tsx"
  
  echo "  → $output_file"
  
  # Create pages directory if it doesn't exist
  mkdir -p src/pages
  
  # Convert using sed/awk (basic conversion)
  # Full conversion needs manual review
  cat "$file" | \
    sed 's/"use client"//' | \
    sed 's/from "next\/navigation"/from "react-router-dom"/' | \
    sed 's/from "next\/link"/from "react-router-dom"/' | \
    sed 's/useRouter()/useNavigate()/g' | \
    sed 's/const router = useRouter()/const navigate = useNavigate()/g' | \
    sed 's/router\.push(/navigate(/g' | \
    sed 's/router\.replace(/navigate(..., { replace: true }/g' | \
    sed 's/router\.back()/navigate(-1)/g' | \
    sed 's/usePathname()/useLocation().pathname/g' | \
    sed 's/const pathname = usePathname()/const { pathname } = useLocation()/g' | \
    sed 's/<Link href=/<Link to=/g' | \
    sed 's/<Image /<img /g' | \
    sed 's/<\/Image>/<\/img>/g' > "$output_file"
  
  echo "  ✓ Converted"
done

echo "✅ Bulk conversion complete!"
echo "⚠️  Manual review required for:"
echo "   - Image components (need proper img tags)"
echo "   - Complex navigation logic"
echo "   - Search params handling"
echo "   - Suspense boundaries"

