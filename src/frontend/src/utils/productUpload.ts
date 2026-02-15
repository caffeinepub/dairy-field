import type { Product } from '../backend';

export function parseProductUpload(input: string): Product[] {
  const trimmed = input.trim();
  
  if (!trimmed) {
    throw new Error('Input is empty');
  }

  // Try JSON first
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    return parseJSON(trimmed);
  }

  // Try CSV
  return parseCSV(trimmed);
}

function parseJSON(input: string): Product[] {
  try {
    const data = JSON.parse(input);
    const array = Array.isArray(data) ? data : [data];
    
    return array.map((item, index) => {
      if (!item || typeof item !== 'object') {
        throw new Error(`Invalid product at index ${index}: not an object`);
      }

      const { name, category, unit, price, description } = item;

      if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new Error(`Invalid product at index ${index}: name is required and must be a non-empty string`);
      }

      if (!category || typeof category !== 'string' || category.trim() === '') {
        throw new Error(`Invalid product at index ${index}: category is required and must be a non-empty string`);
      }

      if (!unit || typeof unit !== 'string' || unit.trim() === '') {
        throw new Error(`Invalid product at index ${index}: unit is required and must be a non-empty string`);
      }

      const priceNum = Number(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        throw new Error(`Invalid product at index ${index}: price must be a positive number`);
      }

      const product: Product = {
        name: name.trim(),
        category: category.trim(),
        unit: unit.trim(),
        price: BigInt(Math.round(priceNum)),
      };

      if (description && typeof description === 'string' && description.trim() !== '') {
        product.description = description.trim();
      }

      return product;
    });
  } catch (error: any) {
    if (error.message.startsWith('Invalid product')) {
      throw error;
    }
    throw new Error(`Failed to parse JSON: ${error.message}`);
  }
}

function parseCSV(input: string): Product[] {
  const lines = input.split('\n').map(line => line.trim()).filter(line => line);
  
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const requiredFields = ['name', 'category', 'unit', 'price'];
  const missingFields = requiredFields.filter(field => !header.includes(field));
  
  if (missingFields.length > 0) {
    throw new Error(`CSV header missing required fields: ${missingFields.join(', ')}`);
  }

  const nameIndex = header.indexOf('name');
  const categoryIndex = header.indexOf('category');
  const unitIndex = header.indexOf('unit');
  const priceIndex = header.indexOf('price');
  const descriptionIndex = header.indexOf('description');

  const products: Product[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = parseCSVLine(line);

    if (values.length < requiredFields.length) {
      throw new Error(`Row ${i + 1}: insufficient columns (expected at least ${requiredFields.length})`);
    }

    const name = values[nameIndex]?.trim();
    const category = values[categoryIndex]?.trim();
    const unit = values[unitIndex]?.trim();
    const priceStr = values[priceIndex]?.trim();
    const description = descriptionIndex >= 0 ? values[descriptionIndex]?.trim() : undefined;

    if (!name) {
      throw new Error(`Row ${i + 1}: name is required`);
    }

    if (!category) {
      throw new Error(`Row ${i + 1}: category is required`);
    }

    if (!unit) {
      throw new Error(`Row ${i + 1}: unit is required`);
    }

    const priceNum = Number(priceStr);
    if (isNaN(priceNum) || priceNum <= 0) {
      throw new Error(`Row ${i + 1}: price must be a positive number`);
    }

    const product: Product = {
      name,
      category,
      unit,
      price: BigInt(Math.round(priceNum)),
    };

    if (description) {
      product.description = description;
    }

    products.push(product);
  }

  return products;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}
