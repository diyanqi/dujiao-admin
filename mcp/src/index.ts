#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import axios, { type AxiosInstance } from 'axios'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const API_BASE_URL = process.env.DUJIAO_API_BASE_URL || 'http://localhost:8080'
const ADMIN_TOKEN = process.env.DUJIAO_ADMIN_TOKEN || ''
const API_PREFIX = '/api/v1'

// ---------------------------------------------------------------------------
// HTTP client
// ---------------------------------------------------------------------------
const client: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json',
    ...(ADMIN_TOKEN ? { Authorization: `Bearer ${ADMIN_TOKEN}` } : {}),
  },
  timeout: 30000,
})

async function apiGet(path: string, params?: Record<string, unknown>) {
  const res = await client.get(path, { params })
  return res.data
}

async function apiPost(path: string, data?: unknown) {
  const res = await client.post(path, data)
  return res.data
}

async function apiPut(path: string, data?: unknown) {
  const res = await client.put(path, data)
  return res.data
}

async function apiPatch(path: string, data?: unknown) {
  const res = await client.patch(path, data)
  return res.data
}

async function apiDelete(path: string, data?: unknown) {
  const res = await client.delete(path, data ? { data } : undefined)
  return res.data
}

function toText(data: unknown): string {
  return JSON.stringify(data, null, 2)
}

// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------
const server = new McpServer({
  name: 'dujiao-admin-mcp',
  version: '0.1.0',
})

// ---- Public endpoints ------------------------------------------------------

server.tool(
  'get_public_config',
  'Get public site configuration (site name, currency, captcha type, etc.)',
  async () => ({
    content: [{ type: 'text', text: toText(await apiGet('/public/config')) }],
  }),
)

// ---- Authentication --------------------------------------------------------

server.tool(
  'admin_login',
  'Log in as admin and obtain a Bearer token',
  {
    username: z.string().describe('Admin username'),
    password: z.string().describe('Admin password'),
  },
  async ({ username, password }) => ({
    content: [{ type: 'text', text: toText(await apiPost('/admin/login', { username, password })) }],
  }),
)

server.tool(
  'update_password',
  'Change the current admin password',
  {
    old_password: z.string().describe('Current password'),
    new_password: z.string().describe('New password'),
  },
  async ({ old_password, new_password }) => ({
    content: [{ type: 'text', text: toText(await apiPut('/admin/password', { old_password, new_password })) }],
  }),
)

// ---- Dashboard -------------------------------------------------------------

server.tool(
  'get_dashboard_overview',
  'Get operations dashboard overview KPIs',
  {
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
  },
  async (params) => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/dashboard/overview', params)) }],
  }),
)

server.tool(
  'get_dashboard_trends',
  'Get dashboard trend data (orders, revenue, users over time)',
  {
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
    granularity: z.enum(['day', 'week', 'month']).optional().describe('Data granularity'),
  },
  async (params) => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/dashboard/trends', params)) }],
  }),
)

server.tool(
  'get_dashboard_rankings',
  'Get dashboard ranking data (top products, channels, etc.)',
  {
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
  },
  async (params) => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/dashboard/rankings', params)) }],
  }),
)

// ---- Authorization Management ---------------------------------------------

server.tool(
  'get_authz_me',
  'Get current admin permissions, roles and policies',
  async () => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/authz/me')) }],
  }),
)

server.tool(
  'list_authz_roles',
  'List all authorization roles',
  async () => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/authz/roles')) }],
  }),
)

server.tool(
  'create_authz_role',
  'Create a new authorization role',
  { role: z.string().describe('Role name') },
  async ({ role }) => ({
    content: [{ type: 'text', text: toText(await apiPost('/admin/authz/roles', { role })) }],
  }),
)

server.tool(
  'delete_authz_role',
  'Delete an authorization role',
  { role: z.string().describe('Role name') },
  async ({ role }) => ({
    content: [{ type: 'text', text: toText(await apiDelete(`/admin/authz/roles/${encodeURIComponent(role)}`)) }],
  }),
)

server.tool(
  'get_authz_role_policies',
  'Get policies assigned to a role',
  { role: z.string().describe('Role name') },
  async ({ role }) => ({
    content: [{ type: 'text', text: toText(await apiGet(`/admin/authz/roles/${encodeURIComponent(role)}/policies`)) }],
  }),
)

server.tool(
  'grant_authz_policy',
  'Grant a permission policy to a role',
  {
    role: z.string().describe('Role name'),
    object: z.string().describe('API path (e.g. /admin/products)'),
    action: z.string().describe('HTTP method (e.g. GET, POST)'),
  },
  async ({ role, object, action }) => ({
    content: [{ type: 'text', text: toText(await apiPost('/admin/authz/policies', { role, object, action })) }],
  }),
)

server.tool(
  'revoke_authz_policy',
  'Revoke a permission policy from a role',
  {
    role: z.string().describe('Role name'),
    object: z.string().describe('API path'),
    action: z.string().describe('HTTP method'),
  },
  async ({ role, object, action }) => ({
    content: [{ type: 'text', text: toText(await apiDelete('/admin/authz/policies', { role, object, action })) }],
  }),
)

server.tool(
  'list_authz_admins',
  'List all admin users',
  async () => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/authz/admins')) }],
  }),
)

server.tool(
  'create_authz_admin',
  'Create a new admin user',
  {
    username: z.string().describe('Admin username'),
    password: z.string().describe('Admin password'),
    is_super: z.boolean().optional().describe('Whether super admin'),
  },
  async ({ username, password, is_super }) => ({
    content: [{ type: 'text', text: toText(await apiPost('/admin/authz/admins', { username, password, is_super })) }],
  }),
)

server.tool(
  'update_authz_admin',
  'Update an admin user',
  {
    id: z.number().describe('Admin ID'),
    username: z.string().optional().describe('New username'),
    password: z.string().optional().describe('New password'),
    is_super: z.boolean().optional().describe('Super admin flag'),
  },
  async ({ id, ...data }) => ({
    content: [{ type: 'text', text: toText(await apiPut(`/admin/authz/admins/${id}`, data)) }],
  }),
)

server.tool(
  'delete_authz_admin',
  'Delete an admin user',
  { id: z.number().describe('Admin ID') },
  async ({ id }) => ({
    content: [{ type: 'text', text: toText(await apiDelete(`/admin/authz/admins/${id}`)) }],
  }),
)

server.tool(
  'get_authz_admin_roles',
  'Get roles assigned to an admin',
  { id: z.number().describe('Admin ID') },
  async ({ id }) => ({
    content: [{ type: 'text', text: toText(await apiGet(`/admin/authz/admins/${id}/roles`)) }],
  }),
)

server.tool(
  'set_authz_admin_roles',
  'Set roles for an admin user (replaces existing roles)',
  {
    id: z.number().describe('Admin ID'),
    roles: z.array(z.string()).describe('List of role names'),
  },
  async ({ id, roles }) => ({
    content: [{ type: 'text', text: toText(await apiPut(`/admin/authz/admins/${id}/roles`, { roles })) }],
  }),
)

server.tool(
  'list_authz_audit_logs',
  'List admin operation audit logs',
  {
    page: z.number().optional().describe('Page number'),
    page_size: z.number().optional().describe('Page size'),
    operator_admin_id: z.number().optional().describe('Filter by operator admin ID'),
    action: z.string().optional().describe('Filter by action type'),
  },
  async (params) => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/authz/audit-logs', params)) }],
  }),
)

server.tool(
  'list_authz_permission_catalog',
  'Get the full permission catalog (all available API permissions)',
  async () => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/authz/permissions/catalog')) }],
  }),
)

// ---- Products --------------------------------------------------------------

server.tool(
  'list_products',
  'List products with optional filters',
  {
    page: z.number().optional().describe('Page number'),
    page_size: z.number().optional().describe('Page size'),
    keyword: z.string().optional().describe('Search keyword'),
    category_id: z.number().optional().describe('Filter by category ID'),
    is_active: z.boolean().optional().describe('Filter by active status'),
    manual_stock_status: z.enum(['low', 'out', 'all']).optional().describe('Stock status filter'),
  },
  async (params) => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/products', params)) }],
  }),
)

server.tool(
  'get_product',
  'Get product details by ID',
  { id: z.number().describe('Product ID') },
  async ({ id }) => ({
    content: [{ type: 'text', text: toText(await apiGet(`/admin/products/${id}`)) }],
  }),
)

server.tool(
  'create_product',
  'Create a new product',
  {
    title: z.record(z.string()).describe('Multi-language title, e.g. {"zh-CN": "...", "en-US": "..."}'),
    slug: z.string().describe('URL slug identifier'),
    description: z.record(z.string()).optional().describe('Multi-language description'),
    price_amount: z.number().describe('Price in cents'),
    purchase_type: z.enum(['member', 'guest']).describe('Purchase type'),
    fulfillment_type: z.enum(['manual', 'auto']).describe('Fulfillment type'),
    category_id: z.number().optional().describe('Category ID'),
    is_active: z.boolean().optional().describe('Whether active/published'),
    sort_order: z.number().optional().describe('Sort order weight'),
    images: z.array(z.string()).optional().describe('Image URL list'),
    tags: z.array(z.string()).optional().describe('Tag list'),
    manual_stock_total: z.number().optional().describe('Manual stock total'),
  },
  async (data) => ({
    content: [{ type: 'text', text: toText(await apiPost('/admin/products', data)) }],
  }),
)

server.tool(
  'update_product',
  'Update an existing product',
  {
    id: z.number().describe('Product ID'),
    title: z.record(z.string()).optional().describe('Multi-language title'),
    slug: z.string().optional().describe('URL slug'),
    description: z.record(z.string()).optional().describe('Multi-language description'),
    price_amount: z.number().optional().describe('Price in cents'),
    is_active: z.boolean().optional().describe('Whether active'),
    sort_order: z.number().optional().describe('Sort order'),
    category_id: z.number().optional().describe('Category ID'),
    images: z.array(z.string()).optional().describe('Image URL list'),
    tags: z.array(z.string()).optional().describe('Tag list'),
    manual_stock_total: z.number().optional().describe('Manual stock total'),
  },
  async ({ id, ...data }) => ({
    content: [{ type: 'text', text: toText(await apiPut(`/admin/products/${id}`, data)) }],
  }),
)

server.tool(
  'delete_product',
  'Delete a product by ID',
  { id: z.number().describe('Product ID') },
  async ({ id }) => ({
    content: [{ type: 'text', text: toText(await apiDelete(`/admin/products/${id}`)) }],
  }),
)

// ---- Categories ------------------------------------------------------------

server.tool(
  'list_categories',
  'List product categories',
  {
    page: z.number().optional().describe('Page number'),
    page_size: z.number().optional().describe('Page size'),
  },
  async (params) => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/categories', params)) }],
  }),
)

server.tool(
  'create_category',
  'Create a new product category',
  {
    name: z.record(z.string()).describe('Multi-language name, e.g. {"zh-CN": "...", "en-US": "..."}'),
    slug: z.string().describe('URL slug identifier'),
    sort_order: z.number().optional().describe('Sort order weight'),
    is_active: z.boolean().optional().describe('Whether active'),
  },
  async (data) => ({
    content: [{ type: 'text', text: toText(await apiPost('/admin/categories', data)) }],
  }),
)

server.tool(
  'update_category',
  'Update a product category',
  {
    id: z.number().describe('Category ID'),
    name: z.record(z.string()).optional().describe('Multi-language name'),
    slug: z.string().optional().describe('URL slug'),
    sort_order: z.number().optional().describe('Sort order'),
    is_active: z.boolean().optional().describe('Whether active'),
  },
  async ({ id, ...data }) => ({
    content: [{ type: 'text', text: toText(await apiPut(`/admin/categories/${id}`, data)) }],
  }),
)

server.tool(
  'delete_category',
  'Delete a product category',
  { id: z.number().describe('Category ID') },
  async ({ id }) => ({
    content: [{ type: 'text', text: toText(await apiDelete(`/admin/categories/${id}`)) }],
  }),
)

// ---- Card Secrets ----------------------------------------------------------

server.tool(
  'list_card_secrets',
  'List card secrets (license codes)',
  {
    page: z.number().optional().describe('Page number'),
    page_size: z.number().optional().describe('Page size'),
    product_id: z.number().optional().describe('Filter by product ID'),
    batch_id: z.number().optional().describe('Filter by batch ID'),
    status: z.enum(['available', 'reserved', 'used']).optional().describe('Filter by status'),
    keyword: z.string().optional().describe('Search keyword'),
  },
  async (params) => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/card-secrets', params)) }],
  }),
)

server.tool(
  'get_card_secret_stats',
  'Get card secret inventory statistics',
  {
    product_id: z.number().optional().describe('Filter by product ID'),
  },
  async (params) => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/card-secrets/stats', params)) }],
  }),
)

server.tool(
  'list_card_secret_batches',
  'List card secret import batches',
  {
    page: z.number().optional().describe('Page number'),
    page_size: z.number().optional().describe('Page size'),
    product_id: z.number().optional().describe('Filter by product ID'),
  },
  async (params) => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/card-secrets/batches', params)) }],
  }),
)

server.tool(
  'create_card_secret_batch',
  'Create a new card secret batch (generate codes)',
  {
    product_id: z.number().describe('Product ID'),
    sku_id: z.number().optional().describe('SKU ID'),
    quantity: z.number().describe('Number of codes to generate'),
    prefix: z.string().optional().describe('Code prefix'),
    length: z.number().optional().describe('Code length'),
    remark: z.string().optional().describe('Batch remark'),
  },
  async (data) => ({
    content: [{ type: 'text', text: toText(await apiPost('/admin/card-secrets/batch', data)) }],
  }),
)

server.tool(
  'update_card_secret',
  'Update a card secret',
  {
    id: z.number().describe('Card secret ID'),
    status: z.enum(['available', 'reserved', 'used']).optional().describe('New status'),
    remark: z.string().optional().describe('Remark'),
  },
  async ({ id, ...data }) => ({
    content: [{ type: 'text', text: toText(await apiPut(`/admin/card-secrets/${id}`, data)) }],
  }),
)

server.tool(
  'batch_update_card_secret_status',
  'Batch update card secret statuses',
  {
    ids: z.array(z.number()).describe('Card secret IDs'),
    status: z.enum(['available', 'reserved', 'used']).describe('New status'),
  },
  async (data) => ({
    content: [{ type: 'text', text: toText(await apiPatch('/admin/card-secrets/batch-status', data)) }],
  }),
)

server.tool(
  'batch_delete_card_secrets',
  'Batch delete card secrets',
  {
    ids: z.array(z.number()).describe('Card secret IDs to delete'),
  },
  async (data) => ({
    content: [{ type: 'text', text: toText(await apiPost('/admin/card-secrets/batch-delete', data)) }],
  }),
)

// ---- Orders ----------------------------------------------------------------

server.tool(
  'list_orders',
  'List orders with optional filters',
  {
    page: z.number().optional().describe('Page number'),
    page_size: z.number().optional().describe('Page size'),
    keyword: z.string().optional().describe('Search by order number or user'),
    status: z.string().optional().describe('Order status filter'),
    start_date: z.string().optional().describe('Start date filter (YYYY-MM-DD)'),
    end_date: z.string().optional().describe('End date filter (YYYY-MM-DD)'),
    user_id: z.number().optional().describe('Filter by user ID'),
  },
  async (params) => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/orders', params)) }],
  }),
)

server.tool(
  'get_order',
  'Get order details by ID',
  { id: z.number().describe('Order ID') },
  async ({ id }) => ({
    content: [{ type: 'text', text: toText(await apiGet(`/admin/orders/${id}`)) }],
  }),
)

server.tool(
  'update_order_status',
  'Update an order status',
  {
    id: z.number().describe('Order ID'),
    status: z.string().describe('New status'),
    remark: z.string().optional().describe('Remark'),
  },
  async ({ id, ...data }) => ({
    content: [{ type: 'text', text: toText(await apiPatch(`/admin/orders/${id}`, data)) }],
  }),
)

server.tool(
  'refund_order_to_wallet',
  'Refund an order amount to user wallet',
  {
    id: z.number().describe('Order ID'),
    amount: z.string().describe('Refund amount'),
    remark: z.string().optional().describe('Refund remark'),
  },
  async ({ id, ...data }) => ({
    content: [{ type: 'text', text: toText(await apiPost(`/admin/orders/${id}/refund-to-wallet`, data)) }],
  }),
)

server.tool(
  'create_fulfillment',
  'Create a manual fulfillment record for an order',
  {
    order_id: z.number().describe('Order ID'),
    child_order_id: z.number().optional().describe('Child order ID'),
    type: z.enum(['manual', 'auto']).describe('Fulfillment type'),
    content: z.string().describe('Fulfillment content/credentials'),
    remark: z.string().optional().describe('Remark'),
  },
  async (data) => ({
    content: [{ type: 'text', text: toText(await apiPost('/admin/fulfillments', data)) }],
  }),
)

// ---- Payments --------------------------------------------------------------

server.tool(
  'list_payments',
  'List payment records',
  {
    page: z.number().optional().describe('Page number'),
    page_size: z.number().optional().describe('Page size'),
    keyword: z.string().optional().describe('Search keyword'),
    status: z.string().optional().describe('Payment status filter'),
    channel_id: z.number().optional().describe('Filter by payment channel ID'),
    start_date: z.string().optional().describe('Start date filter'),
    end_date: z.string().optional().describe('End date filter'),
    user_id: z.number().optional().describe('Filter by user ID'),
  },
  async (params) => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/payments', params)) }],
  }),
)

server.tool(
  'get_payment',
  'Get payment record details by ID',
  { id: z.number().describe('Payment ID') },
  async ({ id }) => ({
    content: [{ type: 'text', text: toText(await apiGet(`/admin/payments/${id}`)) }],
  }),
)

// ---- Payment Channels ------------------------------------------------------

server.tool(
  'list_payment_channels',
  'List payment channels',
  {
    page: z.number().optional().describe('Page number'),
    page_size: z.number().optional().describe('Page size'),
    is_active: z.boolean().optional().describe('Filter by active status'),
  },
  async (params) => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/payment-channels', params)) }],
  }),
)

server.tool(
  'get_payment_channel',
  'Get payment channel details by ID',
  { id: z.number().describe('Channel ID') },
  async ({ id }) => ({
    content: [{ type: 'text', text: toText(await apiGet(`/admin/payment-channels/${id}`)) }],
  }),
)

server.tool(
  'create_payment_channel',
  'Create a new payment channel',
  {
    name: z.string().describe('Channel name'),
    type: z.string().describe('Channel type (e.g. alipay, wechat, stripe)'),
    config: z.record(z.unknown()).optional().describe('Channel-specific configuration'),
    is_active: z.boolean().optional().describe('Whether active'),
    sort_order: z.number().optional().describe('Sort order'),
  },
  async (data) => ({
    content: [{ type: 'text', text: toText(await apiPost('/admin/payment-channels', data)) }],
  }),
)

server.tool(
  'update_payment_channel',
  'Update a payment channel',
  {
    id: z.number().describe('Channel ID'),
    name: z.string().optional().describe('Channel name'),
    config: z.record(z.unknown()).optional().describe('Channel configuration'),
    is_active: z.boolean().optional().describe('Whether active'),
    sort_order: z.number().optional().describe('Sort order'),
  },
  async ({ id, ...data }) => ({
    content: [{ type: 'text', text: toText(await apiPut(`/admin/payment-channels/${id}`, data)) }],
  }),
)

server.tool(
  'delete_payment_channel',
  'Delete a payment channel',
  { id: z.number().describe('Channel ID') },
  async ({ id }) => ({
    content: [{ type: 'text', text: toText(await apiDelete(`/admin/payment-channels/${id}`)) }],
  }),
)

// ---- Users -----------------------------------------------------------------

server.tool(
  'list_users',
  'List users with optional filters',
  {
    page: z.number().optional().describe('Page number'),
    page_size: z.number().optional().describe('Page size'),
    keyword: z.string().optional().describe('Search by username or email'),
    status: z.string().optional().describe('User status filter'),
    start_date: z.string().optional().describe('Registration start date'),
    end_date: z.string().optional().describe('Registration end date'),
  },
  async (params) => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/users', params)) }],
  }),
)

server.tool(
  'get_user',
  'Get user details by ID',
  { id: z.number().describe('User ID') },
  async ({ id }) => ({
    content: [{ type: 'text', text: toText(await apiGet(`/admin/users/${id}`)) }],
  }),
)

server.tool(
  'update_user',
  'Update user information',
  {
    id: z.number().describe('User ID'),
    username: z.string().optional().describe('New username'),
    email: z.string().optional().describe('New email'),
    status: z.string().optional().describe('User status'),
    remark: z.string().optional().describe('Admin remark'),
  },
  async ({ id, ...data }) => ({
    content: [{ type: 'text', text: toText(await apiPut(`/admin/users/${id}`, data)) }],
  }),
)

server.tool(
  'batch_update_user_status',
  'Batch update user statuses',
  {
    ids: z.array(z.number()).describe('User IDs'),
    status: z.string().describe('New status'),
  },
  async (data) => ({
    content: [{ type: 'text', text: toText(await apiPut('/admin/users/batch-status', data)) }],
  }),
)

server.tool(
  'list_user_login_logs',
  'List user login logs',
  {
    page: z.number().optional().describe('Page number'),
    page_size: z.number().optional().describe('Page size'),
    user_id: z.number().optional().describe('Filter by user ID'),
    start_date: z.string().optional().describe('Start date filter'),
    end_date: z.string().optional().describe('End date filter'),
  },
  async (params) => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/user-login-logs', params)) }],
  }),
)

server.tool(
  'get_user_wallet',
  'Get user wallet account information',
  { id: z.number().describe('User ID') },
  async ({ id }) => ({
    content: [{ type: 'text', text: toText(await apiGet(`/admin/users/${id}/wallet`)) }],
  }),
)

server.tool(
  'list_user_wallet_transactions',
  'List user wallet transactions',
  {
    id: z.number().describe('User ID'),
    page: z.number().optional().describe('Page number'),
    page_size: z.number().optional().describe('Page size'),
    type: z.string().optional().describe('Transaction type filter'),
  },
  async ({ id, ...params }) => ({
    content: [{ type: 'text', text: toText(await apiGet(`/admin/users/${id}/wallet/transactions`, params)) }],
  }),
)

server.tool(
  'adjust_user_wallet',
  'Adjust user wallet balance (add or subtract)',
  {
    id: z.number().describe('User ID'),
    amount: z.string().describe('Amount to adjust'),
    operation: z.enum(['add', 'subtract']).optional().describe('Operation type'),
    currency: z.string().optional().describe('Currency code'),
    remark: z.string().optional().describe('Adjustment remark'),
  },
  async ({ id, ...data }) => ({
    content: [{ type: 'text', text: toText(await apiPost(`/admin/users/${id}/wallet/adjust`, data)) }],
  }),
)

server.tool(
  'list_user_coupon_usages',
  'List coupon usage records for a user',
  {
    id: z.number().describe('User ID'),
    page: z.number().optional().describe('Page number'),
    page_size: z.number().optional().describe('Page size'),
  },
  async ({ id, ...params }) => ({
    content: [{ type: 'text', text: toText(await apiGet(`/admin/users/${id}/coupon-usages`, params)) }],
  }),
)

// ---- Posts -----------------------------------------------------------------

server.tool(
  'list_posts',
  'List blog/announcement posts',
  {
    page: z.number().optional().describe('Page number'),
    page_size: z.number().optional().describe('Page size'),
    keyword: z.string().optional().describe('Search keyword'),
    is_published: z.boolean().optional().describe('Filter by published status'),
  },
  async (params) => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/posts', params)) }],
  }),
)

server.tool(
  'get_post',
  'Get post details by ID',
  { id: z.number().describe('Post ID') },
  async ({ id }) => ({
    content: [{ type: 'text', text: toText(await apiGet(`/admin/posts/${id}`)) }],
  }),
)

server.tool(
  'create_post',
  'Create a new post',
  {
    title: z.record(z.string()).describe('Multi-language title'),
    content: z.record(z.string()).optional().describe('Multi-language content (rich text HTML)'),
    slug: z.string().describe('URL slug'),
    is_published: z.boolean().optional().describe('Whether to publish immediately'),
    sort_order: z.number().optional().describe('Sort order'),
  },
  async (data) => ({
    content: [{ type: 'text', text: toText(await apiPost('/admin/posts', data)) }],
  }),
)

server.tool(
  'update_post',
  'Update a post',
  {
    id: z.number().describe('Post ID'),
    title: z.record(z.string()).optional().describe('Multi-language title'),
    content: z.record(z.string()).optional().describe('Multi-language content'),
    slug: z.string().optional().describe('URL slug'),
    is_published: z.boolean().optional().describe('Whether published'),
    sort_order: z.number().optional().describe('Sort order'),
  },
  async ({ id, ...data }) => ({
    content: [{ type: 'text', text: toText(await apiPut(`/admin/posts/${id}`, data)) }],
  }),
)

server.tool(
  'delete_post',
  'Delete a post',
  { id: z.number().describe('Post ID') },
  async ({ id }) => ({
    content: [{ type: 'text', text: toText(await apiDelete(`/admin/posts/${id}`)) }],
  }),
)

// ---- Banners ---------------------------------------------------------------

server.tool(
  'list_banners',
  'List site banners',
  {
    page: z.number().optional().describe('Page number'),
    page_size: z.number().optional().describe('Page size'),
    is_active: z.boolean().optional().describe('Filter by active status'),
  },
  async (params) => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/banners', params)) }],
  }),
)

server.tool(
  'get_banner',
  'Get banner details by ID',
  { id: z.number().describe('Banner ID') },
  async ({ id }) => ({
    content: [{ type: 'text', text: toText(await apiGet(`/admin/banners/${id}`)) }],
  }),
)

server.tool(
  'create_banner',
  'Create a new banner',
  {
    title: z.record(z.string()).optional().describe('Multi-language title'),
    image_url: z.string().describe('Banner image URL'),
    link_type: z.string().optional().describe('Link type (url, product, post)'),
    link_value: z.string().optional().describe('Link value'),
    is_active: z.boolean().optional().describe('Whether active'),
    sort_order: z.number().optional().describe('Sort order'),
  },
  async (data) => ({
    content: [{ type: 'text', text: toText(await apiPost('/admin/banners', data)) }],
  }),
)

server.tool(
  'update_banner',
  'Update a banner',
  {
    id: z.number().describe('Banner ID'),
    title: z.record(z.string()).optional().describe('Multi-language title'),
    image_url: z.string().optional().describe('Banner image URL'),
    link_type: z.string().optional().describe('Link type'),
    link_value: z.string().optional().describe('Link value'),
    is_active: z.boolean().optional().describe('Whether active'),
    sort_order: z.number().optional().describe('Sort order'),
  },
  async ({ id, ...data }) => ({
    content: [{ type: 'text', text: toText(await apiPut(`/admin/banners/${id}`, data)) }],
  }),
)

server.tool(
  'delete_banner',
  'Delete a banner',
  { id: z.number().describe('Banner ID') },
  async ({ id }) => ({
    content: [{ type: 'text', text: toText(await apiDelete(`/admin/banners/${id}`)) }],
  }),
)

// ---- Coupons ---------------------------------------------------------------

server.tool(
  'list_coupons',
  'List coupons',
  {
    page: z.number().optional().describe('Page number'),
    page_size: z.number().optional().describe('Page size'),
    keyword: z.string().optional().describe('Search keyword'),
    is_active: z.boolean().optional().describe('Filter by active status'),
  },
  async (params) => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/coupons', params)) }],
  }),
)

server.tool(
  'create_coupon',
  'Create a new coupon',
  {
    code: z.string().describe('Coupon code'),
    name: z.string().describe('Coupon name'),
    discount_type: z.enum(['percent', 'fixed']).describe('Discount type'),
    discount_value: z.number().describe('Discount value (percent 0-100 or fixed amount in cents)'),
    min_order_amount: z.number().optional().describe('Minimum order amount in cents'),
    max_uses: z.number().optional().describe('Maximum total uses'),
    max_uses_per_user: z.number().optional().describe('Maximum uses per user'),
    start_at: z.string().optional().describe('Valid from (ISO date)'),
    end_at: z.string().optional().describe('Valid until (ISO date)'),
    is_active: z.boolean().optional().describe('Whether active'),
    scope: z.string().optional().describe('Scope (all or specific products)'),
  },
  async (data) => ({
    content: [{ type: 'text', text: toText(await apiPost('/admin/coupons', data)) }],
  }),
)

server.tool(
  'update_coupon',
  'Update a coupon',
  {
    id: z.number().describe('Coupon ID'),
    name: z.string().optional().describe('Coupon name'),
    is_active: z.boolean().optional().describe('Whether active'),
    end_at: z.string().optional().describe('Expiry date (ISO date)'),
    max_uses: z.number().optional().describe('Maximum total uses'),
  },
  async ({ id, ...data }) => ({
    content: [{ type: 'text', text: toText(await apiPut(`/admin/coupons/${id}`, data)) }],
  }),
)

server.tool(
  'delete_coupon',
  'Delete a coupon',
  { id: z.number().describe('Coupon ID') },
  async ({ id }) => ({
    content: [{ type: 'text', text: toText(await apiDelete(`/admin/coupons/${id}`)) }],
  }),
)

// ---- Promotions ------------------------------------------------------------

server.tool(
  'list_promotions',
  'List promotional activities (sale prices)',
  {
    page: z.number().optional().describe('Page number'),
    page_size: z.number().optional().describe('Page size'),
    is_active: z.boolean().optional().describe('Filter by active status'),
  },
  async (params) => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/promotions', params)) }],
  }),
)

server.tool(
  'create_promotion',
  'Create a new promotion (sale event)',
  {
    name: z.string().describe('Promotion name'),
    discount_type: z.enum(['percent', 'fixed']).describe('Discount type'),
    discount_value: z.number().describe('Discount value'),
    start_at: z.string().optional().describe('Start time (ISO date)'),
    end_at: z.string().optional().describe('End time (ISO date)'),
    is_active: z.boolean().optional().describe('Whether active'),
    scope: z.string().optional().describe('Scope'),
    product_ids: z.array(z.number()).optional().describe('Applicable product IDs'),
  },
  async (data) => ({
    content: [{ type: 'text', text: toText(await apiPost('/admin/promotions', data)) }],
  }),
)

server.tool(
  'update_promotion',
  'Update a promotion',
  {
    id: z.number().describe('Promotion ID'),
    name: z.string().optional().describe('Promotion name'),
    is_active: z.boolean().optional().describe('Whether active'),
    end_at: z.string().optional().describe('End time'),
    discount_value: z.number().optional().describe('Discount value'),
  },
  async ({ id, ...data }) => ({
    content: [{ type: 'text', text: toText(await apiPut(`/admin/promotions/${id}`, data)) }],
  }),
)

server.tool(
  'delete_promotion',
  'Delete a promotion',
  { id: z.number().describe('Promotion ID') },
  async ({ id }) => ({
    content: [{ type: 'text', text: toText(await apiDelete(`/admin/promotions/${id}`)) }],
  }),
)

// ---- System Settings -------------------------------------------------------

server.tool(
  'get_settings',
  'Get system settings',
  {
    group: z.string().optional().describe('Settings group filter'),
  },
  async (params) => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/settings', params)) }],
  }),
)

server.tool(
  'update_settings',
  'Update system settings',
  {
    settings: z.record(z.unknown()).describe('Settings key-value pairs to update'),
  },
  async ({ settings }) => ({
    content: [{ type: 'text', text: toText(await apiPut('/admin/settings', settings)) }],
  }),
)

server.tool(
  'get_smtp_settings',
  'Get SMTP email settings',
  async () => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/settings/smtp')) }],
  }),
)

server.tool(
  'get_captcha_settings',
  'Get captcha (CAPTCHA) settings',
  async () => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/settings/captcha')) }],
  }),
)

server.tool(
  'get_telegram_auth_settings',
  'Get Telegram login authentication settings',
  async () => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/settings/telegram-auth')) }],
  }),
)

// ---- Skills ----------------------------------------------------------------

server.tool(
  'list_skills',
  'List AI skill configurations',
  {
    page: z.number().optional().describe('Page number'),
    page_size: z.number().optional().describe('Page size'),
    keyword: z.string().optional().describe('Search keyword'),
    status: z.enum(['active', 'inactive']).optional().describe('Filter by status'),
  },
  async (params) => ({
    content: [{ type: 'text', text: toText(await apiGet('/admin/skills', params)) }],
  }),
)

server.tool(
  'get_skill',
  'Get AI skill configuration details by ID',
  { id: z.number().describe('Skill ID') },
  async ({ id }) => ({
    content: [{ type: 'text', text: toText(await apiGet(`/admin/skills/${id}`)) }],
  }),
)

server.tool(
  'create_skill',
  'Create a new AI skill configuration',
  {
    name: z.string().describe('Skill name'),
    description: z.string().optional().describe('Skill description'),
    system_prompt: z.string().describe('System prompt for the AI'),
    enabled_tools: z.array(z.string()).optional().describe('List of enabled MCP tool names'),
    status: z.enum(['active', 'inactive']).optional().describe('Skill status'),
  },
  async (data) => ({
    content: [{ type: 'text', text: toText(await apiPost('/admin/skills', data)) }],
  }),
)

server.tool(
  'update_skill',
  'Update an AI skill configuration',
  {
    id: z.number().describe('Skill ID'),
    name: z.string().optional().describe('Skill name'),
    description: z.string().optional().describe('Skill description'),
    system_prompt: z.string().optional().describe('System prompt'),
    enabled_tools: z.array(z.string()).optional().describe('List of enabled MCP tool names'),
    status: z.enum(['active', 'inactive']).optional().describe('Skill status'),
  },
  async ({ id, ...data }) => ({
    content: [{ type: 'text', text: toText(await apiPut(`/admin/skills/${id}`, data)) }],
  }),
)

server.tool(
  'delete_skill',
  'Delete an AI skill configuration',
  { id: z.number().describe('Skill ID') },
  async ({ id }) => ({
    content: [{ type: 'text', text: toText(await apiDelete(`/admin/skills/${id}`)) }],
  }),
)

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
const transport = new StdioServerTransport()
await server.connect(transport)
