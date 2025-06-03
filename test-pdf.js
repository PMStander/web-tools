// Simple script to create a test PDF and test the upload functionality
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function createTestPDF() {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a page
  const page = pdfDoc.addPage([600, 400]);
  
  // Get a font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Add some text
  page.drawText('This is a test PDF document for testing PDF tools.', {
    x: 50,
    y: 350,
    size: 16,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('It contains multiple lines of text to test text extraction.', {
    x: 50,
    y: 320,
    size: 14,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('This should be extracted by the PDF text extraction tool.', {
    x: 50,
    y: 290,
    size: 14,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Testing PDF processing functionality...', {
    x: 50,
    y: 260,
    size: 12,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  // Serialize the PDF
  const pdfBytes = await pdfDoc.save();
  
  // Save to file
  fs.writeFileSync('test-document.pdf', pdfBytes);
  console.log('Test PDF created: test-document.pdf');
  
  return pdfBytes;
}

async function testFileUpload(pdfBytes) {
  try {
    console.log('Testing file upload...');
    
    // Create form data
    const formData = new FormData();
    formData.append('file', Buffer.from(pdfBytes), {
      filename: 'test-document.pdf',
      contentType: 'application/pdf'
    });
    
    // Upload file
    const response = await fetch('http://localhost:8000/api/files/upload', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    console.log('Upload result:', result);
    
    if (result.success) {
      return result.fileId;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Upload failed:', error);
    return null;
  }
}

async function testTextExtraction(fileId) {
  try {
    console.log('Testing text extraction...');
    
    const response = await fetch('http://localhost:8000/api/tools/pdf/extract-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileId: fileId,
        pages: 'all',
        outputFormat: 'txt',
        options: {
          preserveFormatting: true,
          includeMetadata: true
        }
      })
    });
    
    const result = await response.json();
    console.log('Text extraction result:', result);
    
    return result.success;
  } catch (error) {
    console.error('Text extraction failed:', error);
    return false;
  }
}

async function testOCR(fileId) {
  try {
    console.log('Testing OCR...');
    
    const response = await fetch('http://localhost:8000/api/tools/pdf/ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileId: fileId,
        language: 'eng',
        options: {
          preserveLayout: true,
          enhanceImage: false
        }
      })
    });
    
    const result = await response.json();
    console.log('OCR result:', result);
    
    return result.success;
  } catch (error) {
    console.error('OCR failed:', error);
    return false;
  }
}

async function testConversion(fileId) {
  try {
    console.log('Testing PDF conversion...');
    
    const response = await fetch('http://localhost:8000/api/tools/pdf/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileId: fileId,
        outputFormat: 'txt',
        options: {
          includeMetadata: true,
          preserveFormatting: true
        }
      })
    });
    
    const result = await response.json();
    console.log('Conversion result:', result);
    
    return result.success;
  } catch (error) {
    console.error('Conversion failed:', error);
    return false;
  }
}

async function runTests() {
  console.log('Starting PDF tools tests...\n');
  
  // Create test PDF
  const pdfBytes = await createTestPDF();
  
  // Test file upload
  const fileId = await testFileUpload(pdfBytes);
  if (!fileId) {
    console.log('❌ File upload failed - stopping tests');
    return;
  }
  console.log('✅ File upload successful\n');
  
  // Test text extraction
  const textExtractionSuccess = await testTextExtraction(fileId);
  console.log(textExtractionSuccess ? '✅ Text extraction successful\n' : '❌ Text extraction failed\n');
  
  // Test OCR
  const ocrSuccess = await testOCR(fileId);
  console.log(ocrSuccess ? '✅ OCR successful\n' : '❌ OCR failed\n');
  
  // Test conversion
  const conversionSuccess = await testConversion(fileId);
  console.log(conversionSuccess ? '✅ Conversion successful\n' : '❌ Conversion failed\n');
  
  console.log('Tests completed!');
}

// Run the tests
runTests().catch(console.error);
