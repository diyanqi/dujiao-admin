# Dujiao-Next Admin API 文档

## 概述

- **Base URL**: `/api/v1`
- **请求格式**: `application/json`（文件上传使用 `multipart/form-data`）
- **认证方式**: 除公开接口外，所有接口需在请求头中携带 Bearer Token

```
Authorization: Bearer <token>
```

### 统一响应格式

```json
{
  "status_code": 0,
  "msg": "ok",
  "data": {},
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 100,
    "total_page": 5
  }
}
```

- `status_code` 为 `0` 表示成功，非 `0` 表示失败
- `pagination` 仅分页接口返回

---

## 目录

- [公开接口](#公开接口)
- [认证管理](#认证管理)
- [仪表盘](#仪表盘)
- [权限管理](#权限管理)
- [商品管理](#商品管理)
- [分类管理](#分类管理)
- [卡密管理](#卡密管理)
- [订单管理](#订单管理)
- [支付管理](#支付管理)
- [支付渠道](#支付渠道)
- [用户管理](#用户管理)
- [文章管理](#文章管理)
- [Banner 管理](#banner-管理)
- [优惠券管理](#优惠券管理)
- [促销活动](#促销活动)
- [系统设置](#系统设置)
- [文件上传](#文件上传)

---

## 公开接口

### 获取公开配置

```
GET /api/v1/public/config
```

**响应 `data`**:

| 字段 | 类型 | 说明 |
|------|------|------|
| site_name | string | 站点名称 |
| currency | string | 货币代码 |
| captcha_type | string | 验证码类型 |
| ... | ... | 其他公开配置项 |

---

### 获取图形验证码

```
GET /api/v1/public/captcha/image
```

**响应 `data`**:

| 字段 | 类型 | 说明 |
|------|------|------|
| captcha_id | string | 验证码 ID |
| image | string | Base64 编码的验证码图片 |

---

## 认证管理

### 管理员登录

```
POST /api/v1/admin/login
```

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | ✅ | 用户名 |
| password | string | ✅ | 密码 |
| captcha_payload | object | ❌ | 验证码信息 |
| captcha_payload.captcha_id | string | ❌ | 图形验证码 ID |
| captcha_payload.captcha_code | string | ❌ | 图形验证码值 |
| captcha_payload.turnstile_token | string | ❌ | Turnstile Token |

**响应 `data`**:

| 字段 | 类型 | 说明 |
|------|------|------|
| token | string | 认证 Token |
| user.id | number | 管理员 ID |
| user.username | string | 管理员用户名 |
| expires_at | string | Token 过期时间（RFC3339）|

---

### 修改密码

```
PUT /api/v1/admin/password
```

**请求头**: 需要认证

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| old_password | string | ✅ | 原密码 |
| new_password | string | ✅ | 新密码 |

---

## 仪表盘

### 数据概览

```
GET /api/v1/admin/dashboard/overview
```

**请求头**: 需要认证

**Query 参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| range | string | ✅ | 时间范围：`today` / `7d` / `30d` / `custom` |
| tz | string | ✅ | 时区（如 `Asia/Shanghai`）|
| from | string | ❌ | 自定义起始时间（RFC3339，`range=custom` 时必填）|
| to | string | ❌ | 自定义结束时间（RFC3339，`range=custom` 时必填）|
| force_refresh | boolean | ❌ | 强制刷新缓存 |

**响应 `data`**:

| 字段 | 类型 | 说明 |
|------|------|------|
| range | string | 时间范围 |
| from | string | 起始时间 |
| to | string | 结束时间 |
| timezone | string | 时区 |
| currency | string | 货币代码 |
| kpi.orders_total | number | 总订单数 |
| kpi.paid_orders | number | 已付款订单数 |
| kpi.completed_orders | number | 已完成订单数 |
| kpi.pending_payment_orders | number | 待付款订单数 |
| kpi.processing_orders | number | 处理中订单数 |
| kpi.gmv_paid | string | 已付款 GMV |
| kpi.payments_total | number | 总支付笔数 |
| kpi.payments_success | number | 成功支付笔数 |
| kpi.payments_failed | number | 失败支付笔数 |
| kpi.payment_success_rate | string | 支付成功率（%）|
| kpi.new_users | number | 新注册用户数 |
| kpi.active_products | number | 在售商品数 |
| kpi.out_of_stock_products | number | 缺货商品数 |
| kpi.low_stock_products | number | 库存不足商品数 |
| kpi.auto_available_secrets | number | 自动发货可用卡密数 |
| kpi.manual_available_units | number | 手动发货可用库存数 |
| funnel.orders_created | number | 漏斗：创建订单数 |
| funnel.payments_created | number | 漏斗：发起支付数 |
| funnel.payments_success | number | 漏斗：支付成功数 |
| funnel.orders_paid | number | 漏斗：支付完成订单数 |
| funnel.orders_completed | number | 漏斗：履约完成订单数 |
| funnel.payment_conversion_rate | string | 支付转化率（%）|
| funnel.completion_rate | string | 订单完成率（%）|
| alerts | array | 告警列表 |
| alerts[].type | string | 告警类型 |
| alerts[].level | string | 告警级别：`info` / `warning` / `error` |
| alerts[].value | number | 告警数量 |

---

### 趋势数据

```
GET /api/v1/admin/dashboard/trends
```

**请求头**: 需要认证

**Query 参数**: 同 [数据概览](#数据概览)

**响应 `data`**:

| 字段 | 类型 | 说明 |
|------|------|------|
| range | string | 时间范围 |
| from | string | 起始时间 |
| to | string | 结束时间 |
| timezone | string | 时区 |
| points | array | 趋势数据点 |
| points[].date | string | 日期 |
| points[].orders_total | number | 总订单数 |
| points[].orders_paid | number | 已付款订单数 |
| points[].payments_success | number | 成功支付笔数 |
| points[].payments_failed | number | 失败支付笔数 |
| points[].gmv_paid | string | 已付款 GMV |

---

### 排行榜数据

```
GET /api/v1/admin/dashboard/rankings
```

**请求头**: 需要认证

**Query 参数**: 同 [数据概览](#数据概览)

**响应 `data`**:

| 字段 | 类型 | 说明 |
|------|------|------|
| range | string | 时间范围 |
| from | string | 起始时间 |
| to | string | 结束时间 |
| timezone | string | 时区 |
| top_products | array | 热销商品排行 |
| top_products[].product_id | number | 商品 ID |
| top_products[].title | string | 商品名称 |
| top_products[].paid_orders | number | 付款订单数 |
| top_products[].quantity | number | 销售数量 |
| top_products[].paid_amount | string | 付款金额 |
| top_channels | array | 支付渠道排行 |
| top_channels[].channel_id | number | 渠道 ID |
| top_channels[].channel_name | string | 渠道名称 |
| top_channels[].provider_type | string | 服务商类型 |
| top_channels[].channel_type | string | 渠道类型 |
| top_channels[].success_count | number | 成功支付笔数 |
| top_channels[].failed_count | number | 失败支付笔数 |
| top_channels[].success_amount | string | 成功支付金额 |
| top_channels[].success_rate | string | 成功率（%）|

---

## 权限管理

### 获取当前管理员权限

```
GET /api/v1/admin/authz/me
```

**请求头**: 需要认证

**响应 `data`**:

| 字段 | 类型 | 说明 |
|------|------|------|
| admin_id | number | 管理员 ID |
| is_super | boolean | 是否超级管理员 |
| roles | string[] | 角色列表 |
| policies | array | 权限策略列表 |
| policies[].subject | string | 主体（角色名）|
| policies[].object | string | 资源路径 |
| policies[].action | string | 操作方法（GET/POST/PUT/DELETE 等）|

---

### 获取角色列表

```
GET /api/v1/admin/authz/roles
```

**请求头**: 需要认证

**响应 `data`**: `string[]`（角色名称列表）

---

### 创建角色

```
POST /api/v1/admin/authz/roles
```

**请求头**: 需要认证

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| role | string | ✅ | 角色名称 |

---

### 删除角色

```
DELETE /api/v1/admin/authz/roles/:role
```

**请求头**: 需要认证

**路径参数**: `role` - 角色名称（需 URL 编码）

---

### 获取角色权限策略

```
GET /api/v1/admin/authz/roles/:role/policies
```

**请求头**: 需要认证

**路径参数**: `role` - 角色名称（需 URL 编码）

**响应 `data`**: `AdminAuthzPolicy[]`（权限策略列表，结构同上）

---

### 授予权限策略

```
POST /api/v1/admin/authz/policies
```

**请求头**: 需要认证

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| role | string | ✅ | 角色名称 |
| object | string | ✅ | 资源路径（如 `/admin/products`）|
| action | string | ✅ | 操作方法（如 `GET`）|

---

### 撤销权限策略

```
DELETE /api/v1/admin/authz/policies
```

**请求头**: 需要认证

**请求体**: 同 [授予权限策略](#授予权限策略)

---

### 获取权限目录

```
GET /api/v1/admin/authz/permissions/catalog
```

**请求头**: 需要认证

**响应 `data`**:

| 字段 | 类型 | 说明 |
|------|------|------|
| [].module | string | 模块名称 |
| [].method | string | HTTP 方法 |
| [].object | string | 资源路径 |
| [].permission | string | 权限标识 |

---

### 获取管理员列表

```
GET /api/v1/admin/authz/admins
```

**请求头**: 需要认证

**响应 `data`**:

| 字段 | 类型 | 说明 |
|------|------|------|
| [].id | number | 管理员 ID |
| [].username | string | 用户名 |
| [].is_super | boolean | 是否超级管理员 |
| [].last_login_at | string | 最近登录时间 |
| [].created_at | string | 创建时间 |
| [].roles | string[] | 角色列表 |

---

### 创建管理员

```
POST /api/v1/admin/authz/admins
```

**请求头**: 需要认证

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | ✅ | 用户名 |
| password | string | ✅ | 密码 |
| is_super | boolean | ❌ | 是否超级管理员，默认 `false` |

**响应 `data`**: 新创建的管理员对象（结构同列表项）

---

### 更新管理员

```
PUT /api/v1/admin/authz/admins/:id
```

**请求头**: 需要认证

**路径参数**: `id` - 管理员 ID

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | ❌ | 用户名 |
| password | string | ❌ | 新密码 |
| is_super | boolean | ❌ | 是否超级管理员 |

---

### 删除管理员

```
DELETE /api/v1/admin/authz/admins/:id
```

**请求头**: 需要认证

**路径参数**: `id` - 管理员 ID

---

### 获取管理员角色

```
GET /api/v1/admin/authz/admins/:id/roles
```

**请求头**: 需要认证

**路径参数**: `id` - 管理员 ID

**响应 `data`**: `string[]`（角色名称列表）

---

### 设置管理员角色

```
PUT /api/v1/admin/authz/admins/:id/roles
```

**请求头**: 需要认证

**路径参数**: `id` - 管理员 ID

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| roles | string[] | ✅ | 角色名称列表 |

---

### 获取操作审计日志

```
GET /api/v1/admin/authz/audit-logs
```

**请求头**: 需要认证

**Query 参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | ❌ | 页码，默认 1 |
| page_size | number | ❌ | 每页数量，默认 20 |

**响应 `data`**:

| 字段 | 类型 | 说明 |
|------|------|------|
| [].id | number | 日志 ID |
| [].operator_admin_id | number | 操作者管理员 ID |
| [].operator_username | string | 操作者用户名 |
| [].target_admin_id | number | 被操作的管理员 ID |
| [].target_username | string | 被操作的管理员用户名 |
| [].action | string | 操作类型 |
| [].role | string | 相关角色 |
| [].object | string | 相关资源路径 |
| [].method | string | HTTP 方法 |
| [].request_id | string | 请求 ID |
| [].detail | object | 详情数据 |
| [].created_at | string | 创建时间 |

---

## 商品管理

### 获取商品列表

```
GET /api/v1/admin/products
```

**请求头**: 需要认证

**Query 参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | ❌ | 页码，默认 1 |
| page_size | number | ❌ | 每页数量，默认 10 |
| keyword | string | ❌ | 关键词搜索 |
| category_id | number | ❌ | 分类 ID 筛选 |
| is_active | boolean | ❌ | 上架状态筛选 |
| manual_stock_status | string | ❌ | 手动库存状态：`low` / `out` / `all` |

---

### 获取商品详情

```
GET /api/v1/admin/products/:id
```

**请求头**: 需要认证

**路径参数**: `id` - 商品 ID

---

### 创建商品

```
POST /api/v1/admin/products
```

**请求头**: 需要认证

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | object | ✅ | 多语言标题，如 `{"zh-CN": "...", "en-US": "..."}` |
| slug | string | ✅ | URL 标识符 |
| description | object | ❌ | 多语言简介 |
| content | object | ❌ | 多语言详细内容（富文本）|
| seo_meta | object | ❌ | SEO 元信息 `{keywords, description}` |
| price_amount | number | ✅ | 价格（分）|
| images | string[] | ❌ | 图片 URL 列表 |
| tags | string[] | ❌ | 标签列表 |
| purchase_type | string | ✅ | 购买类型：`member` / `guest` |
| fulfillment_type | string | ✅ | 发货类型：`manual` / `auto` |
| manual_stock_total | number | ❌ | 手动库存总量 |
| category_id | number | ❌ | 分类 ID |
| is_active | boolean | ❌ | 是否上架，默认 `true` |
| sort_order | number | ❌ | 排序权重 |
| skus | array | ❌ | SKU 列表 |
| skus[].sku_code | string | ✅ | SKU 编码 |
| skus[].spec_values | object | ❌ | 规格值（多语言）|
| skus[].price_amount | number | ✅ | SKU 价格（分）|
| skus[].manual_stock_total | number | ❌ | SKU 手动库存 |
| skus[].is_active | boolean | ❌ | SKU 是否启用 |
| skus[].sort_order | number | ❌ | SKU 排序权重 |

---

### 更新商品

```
PUT /api/v1/admin/products/:id
```

**请求头**: 需要认证

**路径参数**: `id` - 商品 ID

**请求体**: 同 [创建商品](#创建商品)（所有字段均可选）

---

### 删除商品

```
DELETE /api/v1/admin/products/:id
```

**请求头**: 需要认证

**路径参数**: `id` - 商品 ID

---

## 分类管理

### 获取分类列表

```
GET /api/v1/admin/categories
```

**请求头**: 需要认证

**Query 参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | ❌ | 页码 |
| page_size | number | ❌ | 每页数量 |

---

### 创建分类

```
POST /api/v1/admin/categories
```

**请求头**: 需要认证

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | object | ✅ | 多语言名称，如 `{"zh-CN": "...", "en-US": "..."}` |
| slug | string | ✅ | URL 标识符 |
| sort_order | number | ❌ | 排序权重 |
| is_active | boolean | ❌ | 是否启用 |

---

### 更新分类

```
PUT /api/v1/admin/categories/:id
```

**请求头**: 需要认证

**路径参数**: `id` - 分类 ID

**请求体**: 同 [创建分类](#创建分类)（所有字段均可选）

---

### 删除分类

```
DELETE /api/v1/admin/categories/:id
```

**请求头**: 需要认证

**路径参数**: `id` - 分类 ID

---

## 卡密管理

### 获取卡密列表

```
GET /api/v1/admin/card-secrets
```

**请求头**: 需要认证

**Query 参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | ❌ | 页码 |
| page_size | number | ❌ | 每页数量 |
| batch_id | number | ❌ | 批次 ID 筛选 |
| product_id | number | ❌ | 商品 ID 筛选 |
| status | string | ❌ | 状态筛选：`available` / `reserved` / `used` |
| keyword | string | ❌ | 关键词搜索 |

---

### 更新卡密

```
PUT /api/v1/admin/card-secrets/:id
```

**请求头**: 需要认证

**路径参数**: `id` - 卡密 ID

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| secret | string | ❌ | 卡密内容 |
| status | string | ❌ | 状态：`available` / `reserved` / `used` |

---

### 批量更新卡密状态

```
PATCH /api/v1/admin/card-secrets/batch-status
```

**请求头**: 需要认证

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ids | number[] | ✅ | 卡密 ID 列表 |
| status | string | ✅ | 目标状态：`available` / `reserved` / `used` |

**响应 `data`**:

| 字段 | 类型 | 说明 |
|------|------|------|
| affected | number | 受影响的记录数 |

---

### 批量删除卡密

```
POST /api/v1/admin/card-secrets/batch-delete
```

**请求头**: 需要认证

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ids | number[] | ✅ | 卡密 ID 列表 |

**响应 `data`**:

| 字段 | 类型 | 说明 |
|------|------|------|
| affected | number | 受影响的记录数 |

---

### 创建卡密批次

```
POST /api/v1/admin/card-secrets/batch
```

**请求头**: 需要认证

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| product_id | number | ✅ | 商品 ID |
| sku_id | number | ❌ | SKU ID |
| secrets | string[] | ✅ | 卡密内容列表 |
| remark | string | ❌ | 备注 |

---

### 导入卡密（CSV）

```
POST /api/v1/admin/card-secrets/import
Content-Type: multipart/form-data
```

**请求头**: 需要认证

**表单字段**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | ✅ | CSV 文件 |

---

### 导出卡密

```
POST /api/v1/admin/card-secrets/export
```

**请求头**: 需要认证

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ids | number[] | ✅ | 卡密 ID 列表 |
| format | string | ✅ | 导出格式：`txt` / `csv` |

**响应**: 文件流（`application/octet-stream`）

---

### 获取卡密统计

```
GET /api/v1/admin/card-secrets/stats
```

**请求头**: 需要认证

**Query 参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| product_id | number | ❌ | 商品 ID 筛选 |

---

### 获取卡密批次列表

```
GET /api/v1/admin/card-secrets/batches
```

**请求头**: 需要认证

**Query 参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | ❌ | 页码 |
| page_size | number | ❌ | 每页数量 |
| product_id | number | ❌ | 商品 ID 筛选 |

---

### 获取卡密导入模板

```
GET /api/v1/admin/card-secrets/template
```

**请求头**: 需要认证

**响应**: CSV 模板文件

---

## 订单管理

### 获取订单列表

```
GET /api/v1/admin/orders
```

**请求头**: 需要认证

**Query 参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | ❌ | 页码 |
| page_size | number | ❌ | 每页数量 |
| keyword | string | ❌ | 关键词搜索（订单号、用户等）|
| status | string | ❌ | 订单状态筛选 |
| user_id | number | ❌ | 用户 ID 筛选 |
| created_from | string | ❌ | 创建时间起始（RFC3339）|
| created_to | string | ❌ | 创建时间结束（RFC3339）|

---

### 获取订单详情

```
GET /api/v1/admin/orders/:id
```

**请求头**: 需要认证

**路径参数**: `id` - 订单 ID

---

### 更新订单状态

```
PATCH /api/v1/admin/orders/:id
```

**请求头**: 需要认证

**路径参数**: `id` - 订单 ID

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | ✅ | 新状态 |
| remark | string | ❌ | 备注 |

---

### 订单退款至钱包

```
POST /api/v1/admin/orders/:id/refund-to-wallet
```

**请求头**: 需要认证

**路径参数**: `id` - 订单 ID

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| amount | string | ✅ | 退款金额 |
| remark | string | ❌ | 备注 |

**响应 `data`**:

| 字段 | 类型 | 说明 |
|------|------|------|
| order | object | 更新后的订单信息 |
| transaction | object | 钱包流水记录 |

---

### 创建履约记录

```
POST /api/v1/admin/fulfillments
```

**请求头**: 需要认证

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| order_id | number | ✅ | 订单 ID |
| content | string | ✅ | 履约内容（如卡密、发货信息）|
| remark | string | ❌ | 备注 |

---

## 支付管理

### 获取支付记录列表

```
GET /api/v1/admin/payments
```

**请求头**: 需要认证

**Query 参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | ❌ | 页码 |
| page_size | number | ❌ | 每页数量 |
| status | string | ❌ | 状态筛选 |
| user_id | number | ❌ | 用户 ID 筛选 |
| order_id | number | ❌ | 订单 ID 筛选 |
| channel_id | number | ❌ | 支付渠道 ID 筛选 |
| created_from | string | ❌ | 创建时间起始（RFC3339）|
| created_to | string | ❌ | 创建时间结束（RFC3339）|

---

### 获取支付记录详情

```
GET /api/v1/admin/payments/:id
```

**请求头**: 需要认证

**路径参数**: `id` - 支付记录 ID

---

### 导出支付记录

```
GET /api/v1/admin/payments/export
```

**请求头**: 需要认证

**Query 参数**: 同 [获取支付记录列表](#获取支付记录列表)（除分页参数外）

**响应**: 文件流（CSV / Excel）

---

## 支付渠道

### 获取支付渠道列表

```
GET /api/v1/admin/payment-channels
```

**请求头**: 需要认证

**Query 参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | ❌ | 页码 |
| page_size | number | ❌ | 每页数量 |

---

### 获取支付渠道详情

```
GET /api/v1/admin/payment-channels/:id
```

**请求头**: 需要认证

**路径参数**: `id` - 渠道 ID

---

### 创建支付渠道

```
POST /api/v1/admin/payment-channels
```

**请求头**: 需要认证

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | ✅ | 渠道名称 |
| provider_type | string | ✅ | 服务商类型（如 `alipay`、`wxpay`）|
| channel_type | string | ✅ | 渠道类型 |
| config | object | ✅ | 渠道配置（不同服务商字段不同）|
| is_active | boolean | ❌ | 是否启用 |
| sort_order | number | ❌ | 排序权重 |

---

### 更新支付渠道

```
PUT /api/v1/admin/payment-channels/:id
```

**请求头**: 需要认证

**路径参数**: `id` - 渠道 ID

**请求体**: 同 [创建支付渠道](#创建支付渠道)（所有字段均可选）

---

### 删除支付渠道

```
DELETE /api/v1/admin/payment-channels/:id
```

**请求头**: 需要认证

**路径参数**: `id` - 渠道 ID

---

## 用户管理

### 获取用户列表

```
GET /api/v1/admin/users
```

**请求头**: 需要认证

**Query 参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | ❌ | 页码 |
| page_size | number | ❌ | 每页数量 |
| keyword | string | ❌ | 关键词搜索（邮箱、昵称等）|
| status | string | ❌ | 状态筛选：`active` / `disabled` |
| created_from | string | ❌ | 注册时间起始（RFC3339）|
| created_to | string | ❌ | 注册时间结束（RFC3339）|
| last_login_from | string | ❌ | 最近登录时间起始（RFC3339）|
| last_login_to | string | ❌ | 最近登录时间结束（RFC3339）|

**响应 `data`**（列表项）:

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 用户 ID |
| email | string | 邮箱 |
| display_name | string | 昵称 |
| status | string | 状态：`active` / `disabled` |
| locale | string | 语言偏好（如 `zh-CN`）|
| wallet_balance | string | 钱包余额 |
| created_at | string | 注册时间 |
| last_login_at | string | 最近登录时间 |

---

### 获取用户详情

```
GET /api/v1/admin/users/:id
```

**请求头**: 需要认证

**路径参数**: `id` - 用户 ID

---

### 更新用户

```
PUT /api/v1/admin/users/:id
```

**请求头**: 需要认证

**路径参数**: `id` - 用户 ID

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | ❌ | 邮箱 |
| nickname | string | ❌ | 昵称 |
| password | string | ❌ | 新密码（留空不修改）|
| locale | string | ❌ | 语言偏好 |
| status | string | ❌ | 状态：`active` / `disabled` |

---

### 批量更新用户状态

```
PUT /api/v1/admin/users/batch-status
```

**请求头**: 需要认证

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_ids | number[] | ✅ | 用户 ID 列表 |
| status | string | ✅ | 目标状态：`active` / `disabled` |

---

### 获取用户登录日志

```
GET /api/v1/admin/user-login-logs
```

**请求头**: 需要认证

**Query 参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | ❌ | 页码 |
| page_size | number | ❌ | 每页数量 |
| user_id | number | ❌ | 用户 ID 筛选 |

---

### 获取用户钱包

```
GET /api/v1/admin/users/:id/wallet
```

**请求头**: 需要认证

**路径参数**: `id` - 用户 ID

**响应 `data`**:

| 字段 | 类型 | 说明 |
|------|------|------|
| user | object | 用户基本信息 |
| account.id | number | 钱包账户 ID |
| account.user_id | number | 用户 ID |
| account.balance | string | 当前余额 |
| account.created_at | string | 创建时间 |
| account.updated_at | string | 更新时间 |

---

### 获取用户钱包流水

```
GET /api/v1/admin/users/:id/wallet/transactions
```

**请求头**: 需要认证

**路径参数**: `id` - 用户 ID

**Query 参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | ❌ | 页码 |
| page_size | number | ❌ | 每页数量 |

**响应 `data`**（列表项）:

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 流水 ID |
| user_id | number | 用户 ID |
| order_id | number\|null | 关联订单 ID |
| type | string | 流水类型 |
| direction | string | 方向：`in` / `out` |
| amount | string | 变动金额 |
| balance_before | string | 变动前余额 |
| balance_after | string | 变动后余额 |
| currency | string | 货币代码 |
| reference | string | 外部参考号 |
| remark | string | 备注 |
| created_at | string | 创建时间 |
| updated_at | string | 更新时间 |

---

### 调整用户钱包余额

```
POST /api/v1/admin/users/:id/wallet/adjust
```

**请求头**: 需要认证

**路径参数**: `id` - 用户 ID

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| amount | string | ✅ | 调整金额 |
| operation | string | ❌ | 操作类型：`add`（增加）/ `subtract`（减少），默认 `add` |
| currency | string | ❌ | 货币代码，默认使用站点货币 |
| remark | string | ❌ | 备注 |

**响应 `data`**:

| 字段 | 类型 | 说明 |
|------|------|------|
| account | object | 更新后的钱包账户信息 |
| transaction | object | 本次流水记录 |

---

### 获取用户优惠券使用记录

```
GET /api/v1/admin/users/:id/coupon-usages
```

**请求头**: 需要认证

**路径参数**: `id` - 用户 ID

**Query 参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | ❌ | 页码 |
| page_size | number | ❌ | 每页数量 |

---

## 文章管理

### 获取文章列表

```
GET /api/v1/admin/posts
```

**请求头**: 需要认证

**Query 参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | ❌ | 页码 |
| page_size | number | ❌ | 每页数量 |
| keyword | string | ❌ | 关键词搜索 |
| is_active | boolean | ❌ | 发布状态筛选 |

---

### 获取文章详情

```
GET /api/v1/admin/posts/:id
```

**请求头**: 需要认证

**路径参数**: `id` - 文章 ID

---

### 创建文章

```
POST /api/v1/admin/posts
```

**请求头**: 需要认证

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | object | ✅ | 多语言标题 |
| slug | string | ✅ | URL 标识符 |
| content | object | ❌ | 多语言内容（富文本）|
| summary | object | ❌ | 多语言摘要 |
| cover_image | string | ❌ | 封面图片 URL |
| is_active | boolean | ❌ | 是否发布 |
| sort_order | number | ❌ | 排序权重 |

---

### 更新文章

```
PUT /api/v1/admin/posts/:id
```

**请求头**: 需要认证

**路径参数**: `id` - 文章 ID

**请求体**: 同 [创建文章](#创建文章)（所有字段均可选）

---

### 删除文章

```
DELETE /api/v1/admin/posts/:id
```

**请求头**: 需要认证

**路径参数**: `id` - 文章 ID

---

## Banner 管理

### 获取 Banner 列表

```
GET /api/v1/admin/banners
```

**请求头**: 需要认证

**Query 参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | ❌ | 页码 |
| page_size | number | ❌ | 每页数量 |

---

### 获取 Banner 详情

```
GET /api/v1/admin/banners/:id
```

**请求头**: 需要认证

**路径参数**: `id` - Banner ID

---

### 创建 Banner

```
POST /api/v1/admin/banners
```

**请求头**: 需要认证

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | object | ✅ | 多语言标题 |
| image | string | ✅ | 图片 URL |
| link | string | ❌ | 跳转链接 |
| is_active | boolean | ❌ | 是否启用 |
| sort_order | number | ❌ | 排序权重 |

---

### 更新 Banner

```
PUT /api/v1/admin/banners/:id
```

**请求头**: 需要认证

**路径参数**: `id` - Banner ID

**请求体**: 同 [创建 Banner](#创建-banner)（所有字段均可选）

---

### 删除 Banner

```
DELETE /api/v1/admin/banners/:id
```

**请求头**: 需要认证

**路径参数**: `id` - Banner ID

---

## 优惠券管理

### 获取优惠券列表

```
GET /api/v1/admin/coupons
```

**请求头**: 需要认证

**Query 参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | ❌ | 页码 |
| page_size | number | ❌ | 每页数量 |
| keyword | string | ❌ | 关键词搜索 |

---

### 创建优惠券

```
POST /api/v1/admin/coupons
```

**请求头**: 需要认证

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | ✅ | 优惠码 |
| type | string | ✅ | 优惠类型：`fixed`（固定减免）/ `percent`（折扣）|
| value | string | ✅ | 优惠值（固定减免金额或折扣百分比）|
| min_order_amount | string | ❌ | 最低订单金额 |
| max_discount_amount | string | ❌ | 最大折扣金额（折扣类型有效）|
| usage_limit | number | ❌ | 总使用次数限制 |
| per_user_limit | number | ❌ | 每用户使用次数限制 |
| expires_at | string | ❌ | 过期时间（RFC3339）|
| is_active | boolean | ❌ | 是否启用 |

---

### 更新优惠券

```
PUT /api/v1/admin/coupons/:id
```

**请求头**: 需要认证

**路径参数**: `id` - 优惠券 ID

**请求体**: 同 [创建优惠券](#创建优惠券)（所有字段均可选）

---

### 删除优惠券

```
DELETE /api/v1/admin/coupons/:id
```

**请求头**: 需要认证

**路径参数**: `id` - 优惠券 ID

---

## 促销活动

### 获取促销活动列表

```
GET /api/v1/admin/promotions
```

**请求头**: 需要认证

**Query 参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | ❌ | 页码 |
| page_size | number | ❌ | 每页数量 |

---

### 创建促销活动

```
POST /api/v1/admin/promotions
```

**请求头**: 需要认证

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | object | ✅ | 多语言活动名称 |
| type | string | ✅ | 促销类型（如 `discount`、`bundle`）|
| config | object | ✅ | 促销配置（不同类型字段不同）|
| starts_at | string | ❌ | 开始时间（RFC3339）|
| ends_at | string | ❌ | 结束时间（RFC3339）|
| is_active | boolean | ❌ | 是否启用 |

---

### 更新促销活动

```
PUT /api/v1/admin/promotions/:id
```

**请求头**: 需要认证

**路径参数**: `id` - 促销活动 ID

**请求体**: 同 [创建促销活动](#创建促销活动)（所有字段均可选）

---

### 删除促销活动

```
DELETE /api/v1/admin/promotions/:id
```

**请求头**: 需要认证

**路径参数**: `id` - 促销活动 ID

---

## 系统设置

### 获取通用设置

```
GET /api/v1/admin/settings
```

**请求头**: 需要认证

**Query 参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| key | string | ❌ | 配置键名（如 `site_config`）|

---

### 更新通用设置

```
PUT /api/v1/admin/settings
```

**请求头**: 需要认证

**请求体**: 配置键值对对象（具体字段取决于配置项）

---

### 获取 SMTP 设置

```
GET /api/v1/admin/settings/smtp
```

**请求头**: 需要认证

---

### 更新 SMTP 设置

```
PUT /api/v1/admin/settings/smtp
```

**请求头**: 需要认证

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| host | string | ✅ | SMTP 服务器地址 |
| port | number | ✅ | SMTP 端口 |
| username | string | ✅ | SMTP 用户名 |
| password | string | ❌ | SMTP 密码（留空不更新）|
| from_name | string | ❌ | 发件人名称 |
| from_email | string | ✅ | 发件人邮箱 |
| use_tls | boolean | ❌ | 是否启用 TLS |

---

### 测试 SMTP 设置

```
POST /api/v1/admin/settings/smtp/test
```

**请求头**: 需要认证

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| to | string | ✅ | 测试收件人邮箱 |

---

### 获取验证码设置

```
GET /api/v1/admin/settings/captcha
```

**请求头**: 需要认证

---

### 更新验证码设置

```
PUT /api/v1/admin/settings/captcha
```

**请求头**: 需要认证

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | ✅ | 验证码类型：`none` / `image` / `turnstile` |
| turnstile_site_key | string | ❌ | Turnstile 站点密钥 |
| turnstile_secret_key | string | ❌ | Turnstile 服务端密钥 |

---

### 获取 Telegram 登录设置

```
GET /api/v1/admin/settings/telegram-auth
```

**请求头**: 需要认证

---

### 更新 Telegram 登录设置

```
PUT /api/v1/admin/settings/telegram-auth
```

**请求头**: 需要认证

**请求体**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| enabled | boolean | ✅ | 是否启用 Telegram 登录 |
| bot_token | string | ❌ | Telegram Bot Token |
| bot_username | string | ❌ | Telegram Bot 用户名 |

---

## 文件上传

### 上传文件

```
POST /api/v1/admin/upload
Content-Type: multipart/form-data
```

**请求头**: 需要认证

**表单字段**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | ✅ | 要上传的文件 |
| scene | string | ❌ | 使用场景（如 `common`、`product`、`banner`），默认 `common` |

**响应 `data`**:

| 字段 | 类型 | 说明 |
|------|------|------|
| url | string | 文件访问 URL |
