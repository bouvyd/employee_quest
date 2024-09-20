# Employee Quest

Employee Quest is a browser extension designed to help you get to know your colleagues at Odoo.
The application is built using React, TypeScript, and Vite, and it leverages various modern web
development tools and libraries.

It's basically a side-project made by an idiot who has difficulties remembering who's who at the
office.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)
- [Building](#building)
- [License](#license)

## Features

- Interactive game to learn about colleagues
- Integration with Odoo for fetching employee data
- Score
- Responsive design with Tailwind CSS

## Installation

To install the project dependencies, run:

```bash
npm install
```

## Usage

To start the development server, run:

```bash
npm run dev
```

This will start the Vite development server.

You then need to install the browser extension on your browser by dragging the `dist` folder
in the Extension Management page of your browser (you may need to enable "Developer mode" first).

## Development

### Project Structure

The main files and directories in this project are:

- `src/`: Contains the source code of the application
  - `api/`: API calls to Odoo and score storage
  - `components/`: React components
  - `interfaces/`: TypeScript interfaces
  - `styles/`: CSS and Tailwind configuration
- `public/`: Static assets
- `dist/`: Build output
- `vite.config.ts`: Vite configuration file
- `tsconfig.json`: TypeScript configuration file

### Key Files

- `src/main.tsx`: Entry point of the React application
- `src/App.tsx`: Main application component
- `src/api/odoo.ts`: API calls to Odoo
- `src/api/scoreStorage.ts`: Score storage functions
- `src/components/employeeCard.tsx`: Employee card component

## Building

To build the project, run:

```bash
npm run build
```

This will create a production build in the `dist/` directory.

You will then be able to install the extension by loading the `dist` folder as an Unpacked Extension
in your browser.

## License

This project is licensed under the MIT License.
