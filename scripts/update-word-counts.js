import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const baseDir = path.join(__dirname, '..')
const publicVocabulariesDir = path.join(baseDir, 'public/vocabularies')
const docsVocabulariesDir = path.join(baseDir, 'docs/vocabularies')
const publicVocabulariesJsonPath = path.join(baseDir, 'public/vocabularies.json')
const docsVocabulariesJsonPath = path.join(baseDir, 'docs/vocabularies.json')

// Function to count words in a vocabulary file
function countWordsInFile(filePath, basePath = 'public') {
  try {
    const fullPath = path.join(baseDir, basePath, filePath)
    if (!fs.existsSync(fullPath)) {
      console.warn(`File not found: ${fullPath}`)
      return 0
    }
    const content = fs.readFileSync(fullPath, 'utf-8')
    const words = JSON.parse(content)
    if (Array.isArray(words)) {
      return words.length
    }
    return 0
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message)
    return 0
  }
}

// Function to check if a file is a category metadata file
function isCategoryFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(content)
    // Category files have a "vocabularies" array property
    return data && Array.isArray(data.vocabularies)
  } catch (error) {
    return false
  }
}

// Function to update wordCount in a category file
function updateCategoryFile(categoryFile, vocabulariesDir, basePath = 'public') {
  const filePath = path.join(vocabulariesDir, categoryFile)
  
  if (!fs.existsSync(filePath)) {
    console.warn(`Category file not found: ${filePath}`)
    return false
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const categoryData = JSON.parse(content)
    
    if (!categoryData.vocabularies || !Array.isArray(categoryData.vocabularies)) {
      console.warn(`Invalid category file structure: ${categoryFile}`)
      return false
    }

    let updated = false
    categoryData.vocabularies.forEach(vocab => {
      if (vocab.file) {
        const actualCount = countWordsInFile(vocab.file, basePath)
        if (vocab.wordCount !== actualCount) {
          console.log(`  ${vocab.name}: ${vocab.wordCount} -> ${actualCount}`)
          vocab.wordCount = actualCount
          updated = true
        }
      }
    })

    if (updated) {
      fs.writeFileSync(filePath, JSON.stringify(categoryData, null, 2) + '\n', 'utf-8')
      console.log(`✓ Updated ${categoryFile}`)
      return true
    } else {
      console.log(`  No changes needed for ${categoryFile}`)
      return false
    }
  } catch (error) {
    console.error(`Error processing ${categoryFile}:`, error.message)
    return false
  }
}

// Function to update vocabularies.json
function updateVocabulariesJson(vocabulariesJsonPath, basePath = 'public') {
  if (!fs.existsSync(vocabulariesJsonPath)) {
    console.warn(`vocabularies.json not found: ${vocabulariesJsonPath}`)
    return false
  }

  try {
    const content = fs.readFileSync(vocabulariesJsonPath, 'utf-8')
    const data = JSON.parse(content)
    
    if (!data.categories || !Array.isArray(data.categories)) {
      console.warn('Invalid vocabularies.json structure')
      return false
    }

    let updated = false
    data.categories.forEach(category => {
      if (category.vocabularies && Array.isArray(category.vocabularies)) {
        category.vocabularies.forEach(vocab => {
          if (vocab.file) {
            const actualCount = countWordsInFile(vocab.file, basePath)
            if (vocab.wordCount !== actualCount) {
              console.log(`  ${category.name} > ${vocab.name}: ${vocab.wordCount} -> ${actualCount}`)
              vocab.wordCount = actualCount
              updated = true
            }
          }
        })
      }
    })

    if (updated) {
      fs.writeFileSync(vocabulariesJsonPath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
      console.log(`✓ Updated vocabularies.json`)
      return true
    } else {
      console.log(`  No changes needed for vocabularies.json`)
      return false
    }
  } catch (error) {
    console.error(`Error processing vocabularies.json:`, error.message)
    return false
  }
}

// Function to process a directory (public or docs)
function processDirectory(vocabulariesDir, vocabulariesJsonPath, basePath) {
  console.log(`\nProcessing ${basePath} directory:`)
  console.log('='.repeat(50))

  if (!fs.existsSync(vocabulariesDir)) {
    console.warn(`Directory not found: ${vocabulariesDir}`)
    return 0
  }

  // Get all JSON files
  const files = fs.readdirSync(vocabulariesDir)
  const categoryFiles = files.filter(f => {
    if (!f.endsWith('.json')) return false
    const filePath = path.join(vocabulariesDir, f)
    return isCategoryFile(filePath)
  })

  let totalUpdated = 0

  // Update each category file
  categoryFiles.forEach(file => {
    console.log(`\nProcessing ${file}:`)
    if (updateCategoryFile(file, vocabulariesDir, basePath)) {
      totalUpdated++
    }
  })

  // Update vocabularies.json
  if (fs.existsSync(vocabulariesJsonPath)) {
    console.log(`\nProcessing vocabularies.json:`)
    if (updateVocabulariesJson(vocabulariesJsonPath, basePath)) {
      totalUpdated++
    }
  }

  return totalUpdated
}

// Main function
function main() {
  console.log('Updating wordCount fields...')
  console.log('='.repeat(50))

  let totalUpdated = 0

  // Process public directory
  totalUpdated += processDirectory(publicVocabulariesDir, publicVocabulariesJsonPath, 'public')

  // Process docs directory
  totalUpdated += processDirectory(docsVocabulariesDir, docsVocabulariesJsonPath, 'docs')

  console.log('\n' + '='.repeat(50))
  console.log(`\n✓ Done! Updated ${totalUpdated} file(s).`)
}

main()

