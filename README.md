 # CitizenAlert

CitizenAlert is a web application designed to help communities stay informed about local incidents and emergencies. Users can create, view, and filter alerts based on categories such as fire, crime, accidents, weather, and more. The web app also includes features like a map view, chatbot assistance, and user authentication and location of the user.


## Features

- **Community Alerts**: View and create alerts for incidents in your area.
- **Map Integration**: Visualize alerts on an interactive map.
- **Category Filtering**: Filter alerts by categories like fire, crime, accidents, weather, etc.
- **Search Functionality**: Search alerts by title, description, or location.
- **User Authentication**: Sign up, log in, and manage your profile.
- **AI Chatbot**: Get assistance through an integrated chatbot powered by Gemini AI.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Flask, Firebase (Firestore, Storage, Authentication)
- **AI Integration**: Gemini AI (via `google.generativeai`)
- **Map Integration**: Leaflet.js
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **UI Components**: Radix UI, ShadCN UI
- **Build Tool**: Vite

## Installation

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/CitizenAlert.git
   cd CitizenAlert
   ```

2. Navigate to the backend directory:
   ```bash
   cd CitizenAlert
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a .env file in the root directory and add the following:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ```

5. Run the Flask server:
   ```bash
   python app.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd CitizenAlert/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open the app in your browser:
   ```
   http://localhost:8080
   ```

## API Endpoints

### `/chat` (POST)
- **Description**: Sends a user message to the Gemini AI chatbot and returns a response.
- **Request Body**:
  ```json
  {
    "message": "Describe the emergency situation here."
  }
  ```
- **Response**:
  ```json
  {
    "response": "Step-by-step instructions from the chatbot."
  }
  ```

## Folder Structure

```
CitizenAlert/
├── app.py                 # Flask backend for chatbot integration
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables
├── frontend/              # Frontend application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Context providers (e.g., AuthContext)
│   │   ├── firebase/      # Firebase configuration
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Application pages (e.g., Home, Login, Signup)
│   │   ├── lib/           # Utility functions
│   │   ├── App.tsx        # Main application component
│   │   ├── index.css      # Global styles
│   │   └── main.tsx       # Application entry point
│   ├── tailwind.config.ts # TailwindCSS configuration
│   ├── vite.config.ts     # Vite configuration
│   ├── tsconfig.json      # TypeScript configuration
│   └── package.json       # Project metadata and dependencies
```

## Environment Variables

### Backend
Create a .env file in the root directory and add:
```env
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend
Create a .env file in the `frontend` directory and add:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Contributing

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add feature-name"
   ```
4. Push to your fork:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

- [Firebase](https://firebase.google.com/) for backend services.
- [Leaflet.js](https://leafletjs.com/) for map integration.
- [Radix UI](https://www.radix-ui.com/) and [ShadCN UI](https://ui.shadcn.com/) for UI components.
- [Lucide Icons](https://lucide.dev/) for icons.
- [Gemini AI](https://ai.google/) for chatbot integration.

---

Feel free to contribute and make CitizenAlert even better!
