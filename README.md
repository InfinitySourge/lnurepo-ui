# LNUrepo UI

This is the frontend client for the **LNUrepo** university project. It's a React-based single-page application (SPA) that provides a user interface for a cloud-hosted message board.

## Overview

The application is designed to interact with a secure backend API and database. Main features include:
- **Message Board:** View and post text messages (limited to 500 characters).
- **Dev Mode / Diagnostic Panel:** A built-in dashboard to monitor the backend API status, verify the isolated database connection in real-time, and check container environment states.

## Tech Stack

- **Frontend:** React.js, Vite
- **Networking & Security:** Cloudflare (handling strict CORS policies and security headers like HSTS and X-Frame-Options)
- **Backend Architecture (Context):** FastAPI hosted on Azure App Service via Docker. The PostgreSQL database is fully isolated inside an Azure Virtual Network (VNet) and connected to the backend via Private DNS integration and SSL.

## Local Setup

To run this project locally, make sure you have Node.js installed.

1. Clone the repository:
   ```bash
   git clone [https://github.com/infinitysourge/lnurepo-ui.git](https://github.com/infinitysourge/lnurepo-ui.git)
