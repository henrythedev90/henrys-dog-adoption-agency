# Henry's Dog Adoption Agency

A modern web application for browsing and finding your perfect canine companion! This app allows users to browse available dogs, filter by various criteria, add favorites, and receive personalized matches based on their preferences.

## 🐶 Features

- **Dog Browsing**: View all available dogs with filtering options
- **Favorites**: Save your favorite dogs for later viewing
- **Match Algorithm**: Receive personalized dog recommendations based on your favorites
- **User Authentication**: Secure sign up and login using JWT, bcrypt, and MongoDB
- **Security**: Avoids information leakage and follows best practices for error handling
- **Responsive Design**: Works on desktop and mobile devices
- **Interactive UI**: Smooth animations and intuitive interface
- **Improved UI/UX**: Enhanced layout, accessibility, and mobile experience

## 🆕 Recent Enhancements

- **Suggested Dogs**: Users now receive personalized suggested dog matches, stored and displayed per user.
- **Customizable Carousel**: The DogCarousel component supports a variable number of cards per slide, auto-advance (autoNextSlide), and optional dot navigation (showDots prop).
- **Robust Authentication**: Improved JWT authentication with automatic access token refresh using refresh tokens, and defensive handling of expired/malformed tokens.
- **Error Handling**: Enhanced error and loading state management throughout the app, including graceful handling of 401 errors and infinite loop prevention.
- **UI Controls**: Carousel navigation, dot indicators, and match generation are now fully customizable via props.
- **Client-Side State Guards**: All localStorage and client-only logic is guarded to prevent hydration mismatches and layout issues on navigation.
- **Security**: Defensive checks for malformed/expired tokens, and secure cookie management.

## 🚀 Tech Stack

- **Frontend Framework**: [Next.js](https://nextjs.org/) 15.3.0 with React 19
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) with React-Redux
- **Styling**: CSS Modules for component-scoped styling
- **Language**: TypeScript for type safety
- **HTTP Client**: Axios for API requests
- **Database**: MongoDB for persistent storage
- **Authentication**: JWT (jsonwebtoken) and bcrypt for secure user authentication
- **Animations**: canvas-confetti for celebration effects
- **Routing**: Next.js App Router and react-router-dom

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- MongoDB instance (local or cloud)

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

3. **Set up environment variables**

   Create a `.env.local` file in the root directory and add your MongoDB URI and JWT secrets:

   ```env
   MONGODB_URI=your-mongodb-uri
   JWT_SECRET=your-jwt-secret
   JWT_REFRESH_SECRET=your-jwt-refresh-secret
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser**

   The application will be available at [http://localhost:3000](http://localhost:3000)

## 🔧 Available Scripts

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to catch issues
- `npm run test` - Run Jest tests

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

## 🛡️ Security & Best Practices

- Uses **bcrypt** for password hashing and **JWT** for stateless authentication
- All sensitive operations are handled server-side with MongoDB
- Error messages are generic to avoid information leakage
- Follows best practices for authentication and authorization

## 📈 Improvements

- Enhanced UI/UX for a smoother and more accessible experience
- Improved error handling and security throughout the app
- Responsive and mobile-friendly design

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
