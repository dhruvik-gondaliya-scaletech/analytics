const fs = require('fs');
const path = require('path');

const featuresDir = path.join(__dirname, 'src', 'features');
const features = fs.readdirSync(featuresDir).filter(f => fs.statSync(path.join(featuresDir, f)).isDirectory());

features.forEach(feature => {
  const Feature = feature.charAt(0).toUpperCase() + feature.slice(1);
  const basePath = path.join(featuresDir, feature);
  const apiPath = path.join(basePath, 'api');
  
  // 1. Remove api directory if it exists
  if (fs.existsSync(apiPath)) {
    fs.rmSync(apiPath, { recursive: true, force: true });
    console.log(`Removed API folder for feature: ${feature}`);
  }

  // 2. Remove API imports and usage from Container.tsx so Next.js doesn't crash
  const containerFilePath = path.join(basePath, 'components', Feature + 'Container.tsx');
  if (fs.existsSync(containerFilePath)) {
    let containerContent = fs.readFileSync(containerFilePath, 'utf8');
    
    // Remove import
    const importRegex = new RegExp(`import { .*Service, .* } from '\\.\\.\\/api\\/.*\\.service';\\n`, 'g');
    containerContent = containerContent.replace(importRegex, '');
    
    // Replace the fetch call with a mock timeout again so UI doesn't crash
    const fetchRegex = new RegExp(`const result = await .*Service\\.getAll\\(\\);\\n[ \\t]*setData\\(result \\|\\| \\[\\]\\);`, 'g');
    containerContent = containerContent.replace(fetchRegex, `// API removed\n        setTimeout(() => {\n          setData([\n            { id: '1', name: 'Sample ${Feature} A', created_at: new Date().toISOString() },\n            { id: '2', name: 'Sample ${Feature} B', created_at: new Date(Date.now() - 86400000).toISOString() }\n          ]);\n          setIsLoading(false);\n        }, 600);`);
    
    // Fallback: If it's already using the data fetch, ensure no dangling service calls
    containerContent = containerContent.replace(/const result = await .*Service\.getAll\(\);/g, "const result = []; // Service removed");
    
    // Also remove the interface from View if it was imported from api
    const viewFilePath = path.join(basePath, 'components', Feature + 'View.tsx');
    if (fs.existsSync(viewFilePath)) {
        let viewContent = fs.readFileSync(viewFilePath, 'utf8');
        const viewImportRegex = new RegExp(`import { ${Feature} } from '\\.\\.\\/api\\/.*\\.service';\\n`, 'g');
        if (viewImportRegex.test(viewContent)) {
            viewContent = viewContent.replace(viewImportRegex, `export interface ${Feature} {\n  id: string;\n  name?: string;\n  created_at: string;\n}\n\n`);
            fs.writeFileSync(viewFilePath, viewContent);
        }
    }
    
    // Also need to redefine the interface in Container if we removed the import
    if (!containerContent.includes(`export interface ${Feature} {`)) {
       containerContent = containerContent.replace(`export function ${Feature}Container() {`, `export interface ${Feature} {\n  id: string;\n  name?: string;\n  created_at: string;\n}\n\nexport function ${Feature}Container() {`);
    }

    fs.writeFileSync(containerFilePath, containerContent);
  }
});

console.log("All api folders removed and containers safely stubbed!");
