# Ganesh's 3D Animated Portfolio

Welcome to the source code for Ganesh's personal portfolio, a visually-rich, single-page application designed to showcase skills and projects through a stunning, animated 3D interface. This project is built with a modern tech stack, prioritizing performance, interactivity, and a seamless user experience.

## Introduction

This project leverAGES a modern tech stack to deliver a high-performance, interactive, and visually stunning experience. The core technologies used include React, Vite, Tailwind CSS, and Three.js, with additional libraries and tools such as GSAP, Framer Motion, and AOS to enhance the overall experience.

This README provides a comprehensive guide to the project's structure, technologies used, and setup instructions.

## Table of Contents

- [Live Demo](#live-demo)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Contributing](#contributing)
- [License](#license)

## Live Demo

[**View the live portfolio here!**](https://ganesh-panda.netlify.app/)

## Key Features

- **Immersive 3D Backgrounds**: Utilizes `react-three-fiber` and `ogl` to create dynamic, interactive 3D visuals that respond to user interaction.
- **Advanced Animations**: Leverages multiple animation libraries including **GSAP (GreenSock)** for scroll-based animations (`ScrollTrigger`), **Framer Motion** for UI transitions, and **AOS (Animate On Scroll)** for reveal effects.
- **Component-Based Architecture**: Built with React, ensuring a modular, scalable, and maintainable codebase.
- **Responsive Design**: Styled with **Tailwind CSS**, the portfolio is fully responsive and optimized for a seamless experience across all devices.
- **Functional Contact Form**: An integrated, working contact form that sends submissions via Web3Forms, complete with custom toast notifications.

## Technology Stack

- **Framework**: React
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **3D Graphics**: React Three Fiber, Three.js, Drei, ogl
- **Animation**:
  - GSAP (GreenSock) with `ScrollTrigger`
  - Framer Motion
  - AOS (Animate On Scroll)
  - React Type Animation
- **Icons**: React Icons

## Project Structure

The project is organized into components, each representing a specific UI section or feature. Here is a mapping of the main UI sections to their corresponding source files:

| Section Name | Component Path                               | Description                                                                                                                            |
| :----------- | :------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| **Home**     | `src/DarkVeil/DarkVeil.jsx`                  | The main hero section featuring a captivating 3D "dark veil" effect and a typing animation for the introduction.                           |
| **About**    | `src/Aurora/Aurora.jsx`                      | This section displays personal information and includes a resume download button, set against a dynamic aurora background effect.          |
| **Education**| `src/LightRays/LightRays.jsx`                | Presents educational background in an animated slider format, complemented by a volumetric light rays effect in the background.            |
| **Skills**   | `src/Particles/Particles.jsx`                | Showcases technical skills categorized into cards, with an interactive 3D particle field in the background.                                |
| **Projects** | `src/Beams/Beams.jsx`                        | Displays a grid of project cards with live links and source code. The background features rotating 3D light beams.                         |
| **Contact**  | `src/Contact/Contact.jsx`                    | Contains the contact form, "Get in Touch" details, and social media links. This component also renders the site's footer.                |
| **Navigation** | `src/CardNav/CardNav.jsx`                    | A fixed navigation header that tracks the user's scroll position and provides smooth-scrolling links to different sections.               |
| **Footer**   | `src/Contact/Contact.jsx`                    | The footer is located within the `Contact` component and includes quick links, services, and copyright information.                        |
| **Toast**    | `src/Contact/Toast.jsx`                      | A reusable toast notification component used to provide feedback for contact form submissions.                                           |

### Background Effects

These components are rendered in `App.jsx` to create the immersive background experience.

| Effect Name   | Component Path                    | Description                                                              |
| :------------ | :-------------------------------- | :----------------------------------------------------------------------- |
| **Light Rays**  | `src/LightRays/LightRays.jsx`       | Generates volumetric light rays that can follow the mouse.               |
| **Particles** | `src/Particles/Particles.jsx`       | Creates a field of interactive particles that move on hover.             |
| **Beams**     | `src/Beams/Beams.jsx`             | Renders rotating 3D beams of light to add depth and movement.            |

## Getting Started

Follow these instructions to get a local copy of the project up and running.

### Prerequisites

- Node.js (v18.x or later recommended)
- npm or any other package manager like Yarn or pnpm.

### Installation

1.  Clone the repository to your local machine:
    ```sh
    git clone https://github.com/your-username/ganesh_portfolio.git
    ```
2.  Navigate into the project directory:
    ```sh
    cd ganesh_portfolio
    ```
3.  Install the dependencies:
    ```sh
    npm install
    ```

### Environment Variables

This project uses an API key from Web3Forms to handle contact form submissions. To run the project locally, you will need to create an environment file.

1.  Create a file named `.env` in the root of the project.
2.  Add your Web3Forms access key to this file:

    ```env
    VITE_WEB3FORMS_ACCESS_KEY=YOUR_ACCESS_KEY_HERE
    ```

> **Note**: While the project currently has a hardcoded key in `src/Contact/Contact.jsx` for simplicity, using an environment variable is the recommended approach for managing sensitive keys.

## Available Scripts

To start the Vite development server with Hot Module Replacement (HMR):

```sh
npm run dev
```

Open http://localhost:5173 (or the port shown in your terminal) to view the project in your browser.



## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production.
- `npm run lint`: Runs ESLint to analyze the code for potential errors.
- `npm run preview`: Serves the production build locally for previewing.
