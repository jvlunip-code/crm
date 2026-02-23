# CRM Frontend Application

A modern CRM application built with Vite, React, TypeScript, shadcn/ui (Radix), and TanStack Query.

## Features

- **Customer Management**: Full CRUD operations for managing customers
- **Service Management**: Create and manage subscription plans with features
- **Notifications System**: View and manage notifications with filtering
- **Real-time Dashboard**: Overview of your business with key metrics
- **Mock Data**: Pre-populated with realistic test data stored in localStorage
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Vite** - Fast build tool and dev server
- **React 18** - UI library
- **TypeScript** - Type safety
- **TanStack Query** - Server state management
- **React Router** - Client-side routing
- **shadcn/ui** - Beautiful UI components built on Radix UI
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

## Prerequisites

**Important:** This project requires Node.js version **20.19+** or **22.12+**

You can check your Node.js version with:
```bash
node --version
```

If you need to upgrade Node.js:
- Use [nvm](https://github.com/nvm-sh/nvm) (recommended):
  ```bash
  nvm install 20
  nvm use 20
  ```
- Or download from [nodejs.org](https://nodejs.org/)

## Getting Started

1. **Install dependencies**:
   ```bash
   cd crm-frontend
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

## Project Structure

```
crm-frontend/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── layout/                # Layout components
│   │   ├── customers/             # Customer-related components
│   │   ├── services/              # Service-related components
│   │   └── notifications/         # Notification components
│   ├── pages/                     # Page components
│   ├── hooks/                     # TanStack Query hooks
│   ├── lib/                       # Utilities and API layer
│   ├── types/                     # TypeScript type definitions
│   └── App.tsx                    # Router setup
├── public/                        # Static assets
└── package.json
```

## Features Overview

### Dashboard
- Real-time statistics on customers, services, and notifications
- Recent activity feed
- Quick stats overview

### Customers
- View all customers in a table
- Search and filter customers
- Add new customers
- Edit existing customers
- Delete customers with confirmation
- Status badges (Active/Inactive)

### Services
- Manage subscription plans
- Add/edit/delete services
- Price and billing cycle management
- Feature tags for each service
- Status management

### Notifications
- View all notifications sorted by date
- Filter by type (Info, Warning, Error, Success)
- Filter by read/unread status
- Mark individual notifications as read
- Mark all notifications as read
- Delete notifications
- Unread count badge in navigation

## Data Persistence

All data is stored in the browser's localStorage, so:
- Data persists across page refreshes
- Each browser/device has its own data
- Data is reset if you clear browser data
- Perfect for testing without a backend

## Mock Data

The application comes pre-populated with:
- 15 customers (mix of active and inactive)
- 8 services/subscription plans
- 10+ notifications of various types

You can clear all data by clearing your browser's localStorage or by deleting the relevant keys:
- `crm_customers`
- `crm_services`
- `crm_notifications`

## API Simulation

The mock API layer simulates realistic network delays (400ms) to provide a realistic user experience with loading states.

## Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Future Enhancements

This CRM is currently using mock data. To connect to a real backend:

1. Replace the mock API functions in `src/lib/api.ts` with actual API calls
2. Update the TanStack Query hooks to handle real server responses
3. Add authentication and authorization
4. Implement real-time updates with WebSockets

## License

MIT
