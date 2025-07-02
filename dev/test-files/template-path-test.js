/**
 * 模板路径处理测试
 * 用于验证新的路径计算功能
 */

const templateService = require('../src/services/templateService');

// 测试用例
const testCases = [
  {
    name: '默认路径（pages/generated/）',
    relativePath: undefined,
    expected: '../../'
  },
  {
    name: '根目录下的页面',
    relativePath: 'page.html',
    expected: ''
  },
  {
    name: '一级子目录',
    relativePath: 'pages/page.html',
    expected: '../'
  },
  {
    name: '二级子目录（默认generated）',
    relativePath: 'pages/generated/page.html',
    expected: '../../'
  },
  {
    name: '三级子目录',
    relativePath: 'pages/generated/category/page.html',
    expected: '../../../'
  },
  {
    name: '四级子目录',
    relativePath: 'pages/generated/category/subcategory/page.html',
    expected: '../../../../'
  },
  {
    name: '深层嵌套',
    relativePath: 'pages/generated/a/b/c/d/page.html',
    expected: '../../../../../../'  // 修正期望值：pages(1) + generated(2) + a(3) + b(4) + c(5) + d(6) = 6级深度
  }
];

console.log('开始测试模板路径计算功能...');
console.log('=' * 50);

let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach((testCase, index) => {
  const result = templateService.calculateRelativePath(testCase.relativePath);
  const passed = result === testCase.expected;
  
  console.log(`测试 ${index + 1}: ${testCase.name}`);
  console.log(`  输入: ${testCase.relativePath || 'undefined'}`);
  console.log(`  期望: '${testCase.expected}'`);
  console.log(`  结果: '${result}'`);
  console.log(`  状态: ${passed ? '✅ 通过' : '❌ 失败'}`);
  console.log('');
  
  if (passed) {
    passedTests++;
  }
});

console.log('=' * 50);
console.log(`测试完成: ${passedTests}/${totalTests} 通过`);

if (passedTests === totalTests) {
  console.log('🎉 所有测试通过！路径计算功能正常工作。');
} else {
  console.log('⚠️  部分测试失败，请检查路径计算逻辑。');
  process.exit(1);
}