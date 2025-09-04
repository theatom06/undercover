# Undercover PWA

## Overview
This project is a Progressive Web App (PWA) for the Undercover game. The app is designed to provide a seamless user experience across various devices with Offline capabilities.

## How to Play
1. Start by entering the names of the players. (Minimum 3 players required)
2. Then select the number of undercovers and blanks. (Minimum 1 undercover, 0 blanks)
3. Click "Start & Reveal" to begin.
4. Pass the device to each player to reveal their word and role.
5. Players take turns describing their words without revealing them.  
   OR
   Players ask each other questions to identify the undercovers.
6. After each round, players vote to eliminate a suspect.
7. The game continues until either all undercovers are eliminated or the undercovers outnumber the civilians.
8. Enjoy the game!

## Getting Started

### Prerequisites
- A modern web browser that supports PWA features.
- A local server for testing or use firebase-tools (npx) serve (optional but recommended).

### Installation
1. Clone the repository or download the project files.
2. Open the `index.html` file in your web browser to view the game.

### Running the Game
- Simply open `index.html` in your browser.
- For a better experience, serve the files using a local server (e.g., using `http-server` or similar).

### Features
- 400+ word pairs for diverse gameplay.
- Customizable player roles (undercover, blank).
- Intuitive UI for easy navigation.
- Responsive design for various screen sizes.
- Offline capabilities through service worker.
- Engaging game mechanics with dynamic UI updates.

## Development
- The project is built using HTML, CSS, and JavaScript.
- The service worker handles caching for offline use and updates.
- Contributions are welcome! Feel free to fork the repository and submit pull requests.

## Contributing
Feel free to submit issues or pull requests if you have suggestions or improvements for the game.

## License
This project is licensed under the MIT License. See the LICENSE file for details.