# YouTube Transcript RAG Pipeline & CMM Design System Study

This project serves a dual purpose as both a functional web application and an educational sandbox for building a modern federal design system.

1.  **Functional:** A Retrieval-Augmented Generation (RAG) pipeline for YouTube video transcripts. Users can ingest YouTube video URLs, which are then processed for transcript extraction and embedding generation.
2.  **Educational:** A "Zero Trust" Federal Design System sandbox that mirrors the requirements of the Case Management Modernization (CMM) program. It focuses on USWDS compliance, a Design Token pipeline with Style Dictionary, and advanced CSS architecture.

## Key Architectural Concepts

-   **Design Token Pipeline:** The project uses **Style Dictionary** to manage design tokens (e.g., colors, fonts, spacing) as a "Single Source of Truth." These tokens, defined in `src/tokens/**/*.json`, are automatically compiled into CSS variables and JavaScript objects, ensuring a consistent and maintainable visual identity.

-   **CSS "Sandwich" Layering:** To integrate the USWDS design system with Tailwind CSS utility classes, the application uses an explicit CSS layer ordering (`@layer base, uswds, cmm, utilities`). This strategy ensures that CMM's custom component styles can override USWDS defaults, and that Tailwind utilities can override everything for fine-grained adjustments, preventing specificity conflicts.

-   **Accessible Components:** All custom components (prefixed with `Cmm`) are built by composing primitives from the `@trussworks/react-uswds` library, ensuring they are accessible (Section 508 compliant) by default.

## Tech Stack

-   **Frontend:** React, TypeScript, React Router DOM
-   **Build Tool:** Vite
-   **Component Development:** Storybook
-   **Styling:**
    -   **Base System:** USWDS (`@trussworks/react-uswds`)
    -   **Utility Classes:** Tailwind CSS
    -   **Design Tokens:** Style Dictionary
    -   **Architecture:** CSS Cascade Layers
-   **Testing:**
    -   **Unit/Integration:** Vitest, React Testing Library
    -   **Accessibility:** vitest-axe, storybook-addon-a11y

## Setup Instructions
-   **Automated Accessibility Pipeline:** To enforce the "Zero Trust" approach to Section 508 compliance, the project integrates `storybook-addon-a11y` for real-time compliance visualization during development and `vitest-axe` for automated unit testing, ensuring components remain violation-free.

## Current Component Library

The following components demonstrate the application of the design system:

-   **`CmmButton`**: Multi-variant button wrapper overriding USWDS defaults via design tokens.
-   **`CmmUrlInput`**: Accessible form group for URL ingestion.
-   **`CmmTranscriptCard`**: High-density data display component utilizing specific typography tokens (`Inter`, `Merriweather`).
-   **`TestTranscriptCardPage`**: Demonstrates accessible, URL-driven pagination for list displays.

## Tech Stack

### Prerequisites

-   Node.js (LTS version recommended)
-   npm (Node Package Manager) or Yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/youtube-transcript-rag.git
    cd youtube-transcript-rag
    ```
2.  Install the dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

### Running the Development Server

To start the development server with hot-reloading:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) (or the port indicated in your console) in your browser to view the application.

### Building for Production

To build the project for production:

```bash
npm run build
# or
yarn build
```

This will compile and optimize your application into the `dist` directory.

### Storybook

To run Storybook and browse the component library:

```bash
npm run storybook
# or
yarn storybook
```

Open [http://localhost:6006](http://localhost:6006) (or the port indicated in your console) in your browser.