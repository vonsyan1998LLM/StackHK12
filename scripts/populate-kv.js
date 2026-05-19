const fs = require('fs');
const path = require('path');

// 读取模板文件
const headerTemplate = fs.readFileSync(path.join(__dirname, '../templates/header.html'), 'utf8');
const footerTemplate = fs.readFileSync(path.join(__dirname, '../templates/footer.html'), 'utf8');

// 读取页面骨架文件
const pagesDir = path.join(__dirname, '../pages');
const pageFiles = fs.readdirSync(pagesDir).filter(file => file.endsWith('.html'));

// 准备要写入KV的数据
const kvData = {
  'template:header': headerTemplate,
  'template:footer': footerTemplate,
};

// 添加页面骨架
pageFiles.forEach(file => {
  const pageName = file.replace('.html', '');
  const pageContent = fs.readFileSync(path.join(pagesDir, file), 'utf8');
  kvData[`page:${pageName}`] = pageContent;
});

// 输出JSON格式，用于手动导入或API调用
console.log(JSON.stringify(kvData, null, 2));

// 如果需要，可以生成一个curl命令示例
console.log('\n# 使用curl导入数据的示例命令:');
console.log('# 请先部署Worker，然后使用以下命令导入数据:');
Object.entries(kvData).forEach(([key, value]) => {
  console.log(`curl -X POST https://your-worker-url.workers.dev/api/templates -H "Content-Type: application/json" -d '{"key":"${key.replace('template:', '')}","content":${JSON.stringify(value)}}'`);
});