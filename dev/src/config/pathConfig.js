/**
 * 路径配置
 * 集中管理应用中使用的所有路径
 */

const path = require('path');

// 项目根目录
const ROOT_DIR = path.resolve(__dirname, '../..');

// 配置对象
const paths = {
  // 根目录
  root: ROOT_DIR,
  
  // prod目录
  prod: path.resolve(ROOT_DIR, '..', 'prod'),
  
  // 临时目录
  temp: path.join(ROOT_DIR, 'temp'),
  
  // 上传目录
  uploads: path.join(ROOT_DIR, 'src', 'uploads'),
  
  // 视图目录
  views: path.join(ROOT_DIR, 'src', 'views'),
  
  // 公共资源目录
  public: path.join(ROOT_DIR, 'src', 'public'),
  
  // 模板文件路径
  templates: {
    header: path.join(path.resolve(ROOT_DIR, '..', 'prod'), 'templates', 'header.html'),
    footer: path.join(path.resolve(ROOT_DIR, '..', 'prod'), 'templates', 'footer.html')
  },
  
  // 获取prod目录下的页面路径
  getPagesPath: function() {
    return path.join(this.prod, 'pages');
  },
  
  // 获取生成页面路径
  getGeneratedPagesPath: function() {
    return path.join(this.prod, 'pages', 'generated');
  },
  
  // 获取静态页面路径
  getStaticPagesPath: function() {
    return path.join(this.prod, 'pages', 'static');
  },
  
  // 获取prod目录下的多语言文件路径
  getLocalesPath: function(lang) {
    return path.join(this.prod, 'locales', lang);
  },
  
  // 获取生成页面的多语言文件路径
  getGeneratedLocalesPath: function(lang) {
    return path.join(this.prod, 'locales', lang, 'generated');
  },
  
  // 获取静态页面的多语言文件路径
  getStaticLocalesPath: function(lang) {
    return path.join(this.prod, 'locales', lang, 'static');
  },
  
  // 获取临时目录下的多语言文件路径
  getTempLocalesPath: function(lang) {
    return path.join(this.temp, 'locales', lang);
  },
  
  // 数据目录
  data: path.join(ROOT_DIR, 'src', 'data'),
  
  // 获取页面数据路径
  getPagesDataPath: function() {
    return path.join(this.data, 'pages');
  },
  
  // 获取单个页面数据文件路径
  getPageDataFile: function(pageName) {
    return path.join(this.data, 'pages', `${pageName}.json`);
  }
};

module.exports = paths;