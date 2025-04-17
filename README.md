# Henry's Dog Adoption Agency

A modern web application for browsing and finding your perfect canine companion! This app allows users to browse available dogs, filter by various criteria, add favorites, and receive personalized matches based on their preferences.

## 🐶 Features

- **Dog Browsing**: View all available dogs with filtering options
- **Favorites**: Save your favorite dogs for later viewing
- **Match Algorithm**: Receive personalized dog recommendations based on your favorites
- **Responsive Design**: Works on desktop and mobile devices
- **Interactive UI**: Smooth animations and intuitive interface

## 🚀 Tech Stack

- **Frontend Framework**: [Next.js](https://nextjs.org/) 15.3.0 with React 19
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) with React-Redux
- **Styling**: CSS Modules for component-scoped styling
- **Language**: TypeScript for type safety
- **HTTP Client**: Axios for API requests
- **Animations**: canvas-confetti for celebration effects
- **Routing**: Next.js App Router and react-router-dom

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

## 🛠️ Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/<yourusername>/henrys-dog-adoption-agency.git
   cd henry-dog-adoption-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open in browser**

   The application will be available at [http://localhost:3000](http://localhost:3000)

## 🔧 Available Scripts

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to catch issues

## 📱 Application Structure

- **pages/api/** - Backend API endpoints organized by functionality (auth, dogs, locations)
- **src/app/** - Next.js App Router pages and layouts for main application views
- **src/components/** - Reusable UI components organized by feature:
  - **auth/** - Login form and authentication-related components
  - **dogs/** - Dog cards, listing, filtering and favorites components
  - **layout/** - Structural components (Header, Footer, Navigation)
  - **ui/** - Generic UI components (Button, Modal, Container)
- **src/hooks/** - Custom React hooks for reusable logic
- **src/lib/** - Utility functions and API client implementation
- **src/store/** - Redux store with slices organized by domain (auth, dogs, filters)
- **src/types/** - TypeScript type definitions for app-wide use

## �� Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
