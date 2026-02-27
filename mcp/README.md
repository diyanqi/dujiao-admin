# Dujiao-Next Admin MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that exposes the Dujiao-Next Admin API as tools for AI assistants (Claude, Cursor, etc.).

## Features

Exposes all Dujiao-Next Admin API endpoints as MCP tools across the following domains:

- **Authentication** – Admin login, password management
- **Dashboard** – Overview KPIs, trend data, rankings
- **Authorization** – Roles, policies, admin users, audit logs
- **Products** – CRUD, search, filter
- **Categories** – CRUD
- **Card Secrets** – Inventory management, batch operations
- **Orders** – List, detail, status update, wallet refund, fulfillment
- **Payments** – Records, channels
- **Users** – Management, wallet, login logs, coupon usage
- **Posts** – Blog / announcements CRUD
- **Banners** – Site banner CRUD
- **Coupons** – Coupon CRUD
- **Promotions** – Sale event CRUD
- **System Settings** – General settings, SMTP, captcha, Telegram auth
- **Skills** – AI skill configuration CRUD

## Installation

```bash
cd mcp
npm install
npm run build
```

## Configuration

Set the following environment variables before running:

| Variable | Description | Default |
|----------|-------------|---------|
| `DUJIAO_API_BASE_URL` | Base URL of the Dujiao-Next backend | `http://localhost:8080` |
| `DUJIAO_ADMIN_TOKEN` | Admin Bearer token for authentication | *(empty)* |

To obtain a token, use the `admin_login` tool or call the login API manually.

## Usage

### With Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "dujiao-admin": {
      "command": "node",
      "args": ["/path/to/dujiao-admin/mcp/dist/index.js"],
      "env": {
        "DUJIAO_API_BASE_URL": "https://your-backend-url",
        "DUJIAO_ADMIN_TOKEN": "your-admin-token"
      }
    }
  }
}
```

### With Cursor / other MCP clients

```json
{
  "mcpServers": {
    "dujiao-admin": {
      "command": "node",
      "args": ["mcp/dist/index.js"],
      "env": {
        "DUJIAO_API_BASE_URL": "https://your-backend-url",
        "DUJIAO_ADMIN_TOKEN": "your-admin-token"
      }
    }
  }
}
```

### Run directly

```bash
DUJIAO_API_BASE_URL=https://your-backend DUJIAO_ADMIN_TOKEN=your-token npm start
```

## Development

```bash
npm run dev   # Run with tsx (no build required)
npm run build # Compile TypeScript to dist/
```

## Available Tools

All tools return JSON-formatted responses.

| Tool | Description |
|------|-------------|
| `get_public_config` | Get public site configuration |
| `admin_login` | Log in as admin |
| `update_password` | Change admin password |
| `get_dashboard_overview` | Dashboard KPIs |
| `get_dashboard_trends` | Trend data over time |
| `get_dashboard_rankings` | Top products / channels |
| `get_authz_me` | Current admin permissions |
| `list_authz_roles` | List all roles |
| `create_authz_role` | Create a role |
| `delete_authz_role` | Delete a role |
| `get_authz_role_policies` | Get role permissions |
| `grant_authz_policy` | Grant permission to role |
| `revoke_authz_policy` | Revoke permission from role |
| `list_authz_admins` | List admin users |
| `create_authz_admin` | Create admin user |
| `update_authz_admin` | Update admin user |
| `delete_authz_admin` | Delete admin user |
| `get_authz_admin_roles` | Get admin roles |
| `set_authz_admin_roles` | Set admin roles |
| `list_authz_audit_logs` | List audit logs |
| `list_authz_permission_catalog` | Full permission catalog |
| `list_products` | List products |
| `get_product` | Get product details |
| `create_product` | Create product |
| `update_product` | Update product |
| `delete_product` | Delete product |
| `list_categories` | List categories |
| `create_category` | Create category |
| `update_category` | Update category |
| `delete_category` | Delete category |
| `list_card_secrets` | List card secrets |
| `get_card_secret_stats` | Card secret statistics |
| `list_card_secret_batches` | List batches |
| `create_card_secret_batch` | Create batch |
| `update_card_secret` | Update card secret |
| `batch_update_card_secret_status` | Batch update status |
| `batch_delete_card_secrets` | Batch delete |
| `list_orders` | List orders |
| `get_order` | Get order details |
| `update_order_status` | Update order status |
| `refund_order_to_wallet` | Refund to wallet |
| `create_fulfillment` | Create fulfillment |
| `list_payments` | List payments |
| `get_payment` | Get payment details |
| `list_payment_channels` | List channels |
| `get_payment_channel` | Get channel details |
| `create_payment_channel` | Create channel |
| `update_payment_channel` | Update channel |
| `delete_payment_channel` | Delete channel |
| `list_users` | List users |
| `get_user` | Get user details |
| `update_user` | Update user |
| `batch_update_user_status` | Batch update status |
| `list_user_login_logs` | Login logs |
| `get_user_wallet` | User wallet info |
| `list_user_wallet_transactions` | Wallet transactions |
| `adjust_user_wallet` | Adjust wallet balance |
| `list_user_coupon_usages` | Coupon usage records |
| `list_posts` | List posts |
| `get_post` | Get post details |
| `create_post` | Create post |
| `update_post` | Update post |
| `delete_post` | Delete post |
| `list_banners` | List banners |
| `get_banner` | Get banner details |
| `create_banner` | Create banner |
| `update_banner` | Update banner |
| `delete_banner` | Delete banner |
| `list_coupons` | List coupons |
| `create_coupon` | Create coupon |
| `update_coupon` | Update coupon |
| `delete_coupon` | Delete coupon |
| `list_promotions` | List promotions |
| `create_promotion` | Create promotion |
| `update_promotion` | Update promotion |
| `delete_promotion` | Delete promotion |
| `get_settings` | Get system settings |
| `update_settings` | Update system settings |
| `get_smtp_settings` | Get SMTP settings |
| `get_captcha_settings` | Get captcha settings |
| `get_telegram_auth_settings` | Get Telegram auth settings |
| `list_skills` | List AI skill configurations |
| `get_skill` | Get skill details |
| `create_skill` | Create skill |
| `update_skill` | Update skill |
| `delete_skill` | Delete skill |
