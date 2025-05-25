# NIS Learning Platform - Frontend

This is the frontend application for the NIS Learning Platform, a modern online learning management system built with React, Material UI, and Vite.

## Features

- Modern, responsive Material UI design
- Interactive course catalog with filtering and sorting
- Video lessons with integrated quiz functionality
- User authentication and profile management
- Course creation and management tools
- Role-based access control for content

## Technology Stack

- **React**: UI library
- **Material UI**: Component library for consistent design
- **React Router**: For navigation and routing
- **Vite**: Build tool and development server
- **Axios**: For API requests
- **Context API**: For state management

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://your-repository-url.git
cd NIS_TEST/frontend
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Start the development server

```bash
npm run dev
# or
yarn dev
```

4. Build for production

```bash
npm run build
# or
yarn build
```

## Project Structure

```
src/
├── assets/          # Static assets
├── components/      # React components
│   └── ui/          # Reusable UI components
├── context/         # React context providers
├── hooks/           # Custom React hooks
├── services/        # API services
└── App.jsx          # Main application component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Connecting to Backend

The frontend application connects to a Django backend API. Make sure the backend server is running at the URL specified in `/src/services/api.js`.

## Contributing

1. Follow the project's coding style and organization
2. Make sure to write clean code without comments
3. Test all features before submitting changes
4. Submit pull requests with clear descriptions of changes

## License

This project is proprietary and confidential. All rights reserved.
