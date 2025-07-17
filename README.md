# Constellation Frontend

[![React 19+](https://img.shields.io/badge/react-19+-00D8FF.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/vite-5.x-blue.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/tailwind-3.x-38B2AC.svg)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)](https://www.typescriptlang.org/)

The frontend application for the **Constellation** ecosystem. This project serves as a unified portal to access various modules, implementing a modern "Application Shell" model to provide a seamless, single-page application experience.

It emphasizes a clean, responsive, and highly customizable user interface, built with a modern frontend toolchain including Vite and React.

## Project Architecture

This is a React monorepo managed with `npm`. It is structured to be scalable and maintainable.

- **`/src/components`**: Holds shared, reusable, "dumb" components (e.g., buttons, inputs).
- **`/src/hooks`**: Contains custom React hooks (e.g., `useClickOutside`) to share logic across components.
- **`/src/pages` or `/src/apps`**: Can hold self-contained application modules (our "Stars").
- **`/src/contexts` (Implicit)**: Global state management (Theme, Animations) is handled via React Context API, defined within `App.tsx`.

```text
constellation-frontend/
│
├── .env.example              # Example environment variables file
├── .gitignore
├── index.html                # Main HTML entry point
├── package.json              # Project dependencies and scripts
├── README.md                 # This file
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
│
└── src/
    ├── App.tsx               # Main application component, layout, and routing setup
    ├── main.tsx              # Application entry point
    │
    ├── components/           # (Future) Shared, reusable components
    └── hooks/
        └── useClickOutside.ts  # Custom hook for detecting clicks outside an element
```

```mermaid
graph TD
    subgraph Constellation_Frontend["Constellation Frontend"]
        direction TB

        APP["main.tsx"] -->|renders| ROUTER["RouterProvider"]

        subgraph Global_Providers["Global Context Providers"]
            style Global_Providers fill:#e6ffed,stroke:#00642e
            BG_PROVIDER["fa:fa-image BackgroundEffectProvider"]
            ANIM_PROVIDER["fa:fa-magic AnimationProvider"]
            THEME_PROVIDER["fa:fa-palette ThemeProvider"]
        end
        
        ROUTER --> BG_PROVIDER --> ANIM_PROVIDER --> THEME_PROVIDER

        subgraph Core_Layout["Core Layout & Pages"]
            style Core_Layout fill:#e6f3ff,stroke:#005cb3
            LAYOUT["fa:fa-columns MainLayout.tsx"]
            OUTLET["fa:fa-window-maximize Outlet"]
            PAGE_EXPENSE["fa:fa-money-bill-wave Expense App"]
            PAGE_FITNESS["fa:fa-bolt Fitness App"]
        end

        THEME_PROVIDER -->|provides context to| LAYOUT
        LAYOUT -->|renders| OUTLET
        ROUTER -->|controls| OUTLET
        OUTLET -->|displays| PAGE_EXPENSE
        OUTLET -->|displays| PAGE_FITNESS
    end
```

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **Routing**: [Routing](https://reactrouter.com/)
- **Global State**: **React Context API**

## Local Development Setup

### Prerequisites

- Node.js (`v18.x` or `v20.x` LTS recommended)
- `npm` (comes bundled with Node.js)

### Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone [your-frontend-repository-url]
   cd constellation-frontend
   ```

2. **Install dependencies:**

   This command installs all necessary packages from `package.json`.

   ```bash
   npm install
   ```

### Configuration
  
Create your local `.env.local` file from the template. This file is for local development variables and is ignored by Git.

```bash
cp .env.example .env.local
```

Then, edit the `.env.local` file with the base URL for the backend API services.

|Variable|Description|Example|
|---|---|---|
|`VITE_API_BASE_URL`|The base URL for the backend API gateway or individual services.| `<http://localhost:8000>`|

### Running the Application

This command starts the Vite development server with hot-reloading enabled.

```bash
npm run dev
```

## Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Compiles and bundles the application for production.
- `npm run lint`: Lints the codebase using ESLint.
- `npm run preview`: Serves the production build locally for testing.

## Key Features & UI Controls

The UI provides several customization options, located in the top-right corner of the content area header.

- **Theme Toggle (Sun/Moon Icon)**: Switches between Light and Dark mode.
- **Animation Toggle (Sparkles/Clock Icon)**: Enables or disables the background star animations.
- **Background Toggle (Image/Slash Icon)**: Toggles the entire starry sky background effect on or off.

All preferences are saved to the browser's `localStorage` and will persist between sessions.
