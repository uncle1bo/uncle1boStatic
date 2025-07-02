/**
 * 重定向管理路由
 * 提供重定向规则的管理API
 */

const express = require('express');
const router = express.Router();
const redirectService = require('../services/redirectService');

// 获取所有重定向规则
router.get('/rules', (req, res) => {
  try {
    const rules = redirectService.getAllRules();
    const stats = redirectService.getStats();
    
    res.json({
      success: true,
      data: {
        rules,
        stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取重定向规则失败',
      error: error.message
    });
  }
});

// 添加自定义重定向规则
router.post('/rules', (req, res) => {
  try {
    const { name, pattern, redirect, description } = req.body;
    
    // 验证必需字段
    if (!name || !pattern || !redirect) {
      return res.status(400).json({
        success: false,
        message: '缺少必需字段: name, pattern, redirect'
      });
    }
    
    // 创建重定向规则
    const rule = {
      name,
      pattern: new RegExp(pattern),
      redirect: new Function('match', `return ${redirect}`),
      description: description || '用户自定义规则'
    };
    
    redirectService.addCustomRule(rule);
    
    res.json({
      success: true,
      message: '重定向规则添加成功',
      data: { ruleName: name }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '添加重定向规则失败',
      error: error.message
    });
  }
});

// 删除自定义重定向规则
router.delete('/rules/:ruleName', (req, res) => {
  try {
    const { ruleName } = req.params;
    
    redirectService.removeCustomRule(ruleName);
    
    res.json({
      success: true,
      message: '重定向规则删除成功',
      data: { ruleName }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '删除重定向规则失败',
      error: error.message
    });
  }
});

// 测试重定向规则
router.post('/test', (req, res) => {
  try {
    const { path } = req.body;
    
    if (!path) {
      return res.status(400).json({
        success: false,
        message: '缺少测试路径'
      });
    }
    
    const redirectInfo = redirectService.processRedirect(path);
    
    res.json({
      success: true,
      data: {
        originalPath: path,
        redirectInfo: redirectInfo || null,
        hasRedirect: !!redirectInfo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '测试重定向规则失败',
      error: error.message
    });
  }
});

// 更新重定向配置选项
router.put('/options', (req, res) => {
  try {
    const options = req.body;
    
    redirectService.updateOptions(options);
    
    res.json({
      success: true,
      message: '重定向配置更新成功',
      data: redirectService.getStats().options
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '更新重定向配置失败',
      error: error.message
    });
  }
});

// 获取重定向统计信息
router.get('/stats', (req, res) => {
  try {
    const stats = redirectService.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取统计信息失败',
      error: error.message
    });
  }
});

module.exports = router;