#!/usr/bin/env node

/**
 * Helper script to generate image mapping code for product images
 * 
 * Usage:
 * 1. Add new product images to assets/images/products/ folder
 * 2. Run this script: node scripts/generate-image-mappings.js
 * 3. Copy the output and update the imageMap in app/store/[id].tsx
 */

const fs = require('fs');
const path = require('path');

const PRODUCTS_DIR = path.join(__dirname, '../assets/images/products');
const PRODUCT_NAMES = [
  // Dairy & Bakery
  'Amul Fresh Milk 1L',
  'Amul Butter 500g',
  'Amul Cheese Slice 200g',
  'Farm Fresh Eggs 12pcs',
  'Amul Curd 200g',
  'Britannia White Bread 400g',
  'Britannia Brown Bread 400g',
  
  // Groceries & Staples
  'Basmati Rice 1kg',
  'Sona Masoori Rice 5kg',
  'Toor Dal 1kg',
  'Coconut Oil 1L',
  'Atta Wheat Flour 5kg',
  'Sugar 1kg',
  'Tata Salt 1kg',
  
  // Beverages & Snacks
  'Coca Cola 600ml',
  'Sprite 600ml',
  'Nestle Maggi 280g',
  'Parle-G Original 200g',
  'Britannia Good Day 150g',
  
  // Fresh Produce
  'Banana Kerala',
  'Apple Shimla',
  'Orange Nagpur',
  'Onion',
  'Tomato',
  'Potato',
  'Green Chilli',
  'Ginger',
  
  // Personal Care
  'Dove Beauty Soap 100g',
  'Head & Shoulders Shampoo 340ml',
  'Colgate Toothpaste 200g',
  
  // Household
  'Surf Excel Detergent 1kg',
  'Vim Dishwash Gel 500ml'
];

function productNameToFileName(productName) {
  return productName
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/\d+[a-z]*$/i, '') // Remove size/unit at end
    .replace(/-$/, ''); // Remove trailing hyphen
}

function generateImageMappings() {
  console.log('🖼️  Generating image mappings for React Native...\n');
  
  if (!fs.existsSync(PRODUCTS_DIR)) {
    console.error(`❌ Products directory not found: ${PRODUCTS_DIR}`);
    console.log('Please create the directory and add product images first.');
    return;
  }

  const imageFiles = fs.readdirSync(PRODUCTS_DIR)
    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
    .sort();

  console.log(`📁 Found ${imageFiles.length} image files in ${PRODUCTS_DIR}\n`);
  
  const mappings = [];
  const missingImages = [];
  
  PRODUCT_NAMES.forEach(productName => {
    const expectedFileName = productNameToFileName(productName);
    const matchingFile = imageFiles.find(file => {
      const nameWithoutExt = file.replace(/\.[^/.]+$/, '');
      return nameWithoutExt === expectedFileName;
    });
    
    if (matchingFile) {
      mappings.push(`    '${productName}': require('@/assets/images/products/${matchingFile}'),`);
      console.log(`✅ ${productName} → ${matchingFile}`);
    } else {
      missingImages.push(`    // '${productName}': require('@/assets/images/products/${expectedFileName}.jpg'),`);
      console.log(`❌ ${productName} → ${expectedFileName}.jpg (MISSING)`);
    }
  });

  console.log(`\n🔧 Copy this code to your imageMap in app/store/[id].tsx:\n`);
  console.log('const imageMap: { [key: string]: any } = {');
  mappings.forEach(mapping => console.log(mapping));
  
  if (missingImages.length > 0) {
    console.log('  // Missing images - add these when you have the files:');
    missingImages.forEach(missing => console.log(missing));
  }
  
  console.log('};');
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ ${mappings.length} images mapped`);
  console.log(`   ❌ ${missingImages.length} images missing`);
  console.log(`   📁 ${imageFiles.length} total image files`);
}

generateImageMappings();