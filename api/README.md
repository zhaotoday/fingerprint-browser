#### 环境
- 获取环境列表：GET /enviroments
- 获取环境详情：GET /enviroments/{id}
- 新建环境：POST /enviroments
- 编辑环境：PUT /enviroments/{id}
- 删除环境：DELETE /enviroments/{id}
- 批量删除环境 DELETE /enviroments/batch/{id1},{id2}
- 启动环境：POST /enviroments/do/open
- 批量启动环境：POST /enviroments/do/open/batch/{id1},{id2}
- 关闭环境：POST /enviroments/do/close
- 批量关闭环境：POST /enviroments/do/close/batch/{id1},{id2}

#### 代理
- 获取代理列表：GET /proxies
- 获取代理详情：GET /proxies/{id}
