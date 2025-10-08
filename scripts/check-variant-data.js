#!/usr/bin/env node

/**
 * Helper script to examine variant data structure from the API
 * This will help us understand the exact structure of attributeDetails.variantCombination
 */

const https = require('http');

function makeRequest() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/pos/products?limit=10',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        if (response.error) {
          console.log('❌ API Error:', response.error);
          console.log('💡 Make sure you have proper authentication set up.');
          return;
        }

        if (response.products && Array.isArray(response.products)) {
          console.log(`🔍 Found ${response.products.length} products\n`);
          
          // Look for products with variant data
          const productsWithVariants = response.products.filter(p => 
            p.attributeDetails && p.attributeDetails.variantCombination
          );
          
          console.log(`📋 Products with variant data: ${productsWithVariants.length}\n`);
          
          productsWithVariants.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name}`);
            console.log('   attributeDetails:', JSON.stringify(product.attributeDetails, null, 4));
            console.log('   variantCombination:', JSON.stringify(product.attributeDetails.variantCombination, null, 4));
            console.log('   ---\n');
          });

          if (productsWithVariants.length === 0) {
            console.log('💡 No products with variant data found. Here\'s a sample product structure:');
            if (response.products[0]) {
              console.log('Sample product:', JSON.stringify(response.products[0], null, 2));
            }
          }

        } else {
          console.log('❌ No products found in response');
          console.log('Response:', JSON.stringify(response, null, 2));
        }
      } catch (error) {
        console.log('❌ Error parsing response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Request error:', error.message);
    console.log('💡 Make sure your server is running on localhost:3000');
  });

  req.end();
}

console.log('🔍 Checking variant data from API...\n');
makeRequest();