# YouTube Transcript RAG Pipeline

This project is a web application designed to facilitate a Retrieval-Augmented Generation (RAG) pipeline for YouTube video transcripts. Users can ingest YouTube video URLs, upon which the application extracts the transcript and generates embeddings for storage in a vector database. This serves as a front-end for a system that can then utilize these embeddings for various RAG-based applications, such as question-answering or content summarization based on YouTube video content.

## Features

-   **YouTube URL Ingestion:** Easily submit YouTube video URLs.
-   **Transcript Extraction:** Initiates the process of extracting the transcript from the provided video.
-   **Embedding Generation:** Generates vector embeddings from the transcript for efficient retrieval.
-   **User-Friendly Interface:** A simple and intuitive interface built with React.

## Tech Stack

-   **Frontend:** React, TypeScript
-   **Build Tool:** Vite
-   **Styling:** Tailwind CSS, USWDS (United States Web Design System)
-   **Component Development:** Storybook

## Setup Instructions

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