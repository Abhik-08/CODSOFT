<<<<<<< HEAD
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
=======
# 🚀 CODSOFT Java Programming Internship

This repository contains all tasks completed during the CodSoft Java Programming Internship.

---

# 👨‍💻 Intern Details

* **Name:** Abhik Mukherjee
* **Role:** Java Programming Intern

---

# 📂 Tasks

## 🎯 Task 1 — Number Game

A modern full-stack Number Guessing Game built using React and Spring Boot.

<img width="926" height="910" alt="Screenshot 2026-05-31 005005" src="https://github.com/user-attachments/assets/108ca626-ccc2-4529-9b6b-ecd3644773f5" />


### ✨ Features

* Random number generation
* High / Low feedback
* Attempts system
* Score tracking
* Multiple rounds
* Responsive modern UI
* Frontend ↔ Backend integration

### 🛠 Tech Stack

* React
* Vite
* Java
* Spring Boot
* REST API

---

## 📊 Task 2 — Student Grade Calculator

A modern full-stack Student Grade Calculator built using React and Spring Boot.

<img width="1848" height="893" alt="Screenshot 2026-05-31 005436" src="https://github.com/user-attachments/assets/5604fd7f-989d-424c-90fb-ca8b9ab0d9f5" />

<img width="1852" height="893" alt="Screenshot 2026-05-31 005458" src="https://github.com/user-attachments/assets/6536440c-cfb7-442b-8d51-b05902811db8" />



### ✨ Features

* Dynamic subject input system
* Total marks calculation
* Percentage calculation
* Grade generation
* Performance analytics
* Responsive dashboard UI
* Frontend ↔ Backend integration
* Modern animations and visualizations

### 🛠 Tech Stack

* React
* Vite
* Java
* Spring Boot
* REST API

---

## 🏧 Task 3 — ATM Interface

🚧 Under Development

---

## 💱 Task 4 — Currency Converter

🚧 Under Development

---

## 🧑‍🎓 Task 5 — Student Management System

🚧 Under Development

---

# 🛠 Skills Learned

* Java Programming
* Object-Oriented Programming (OOP)
* Spring Boot
* REST APIs
* React.js
* Full-Stack Development
* Responsive UI Design
* Git & GitHub
* API Integration
* Problem Solving

---

# 📌 Repository Structure

```bash
CODSOFT/
│
├── Task1-NumberGame/
│
├── Task2-StudentGradeCalculator/
│
├── Task3-ATMInterface/
│
├── Task4-CurrencyConverter/
│
├── Task5-StudentManagementSystem/
│
└── README.md
```

---

# 🌟 Highlights

* Full-Stack Java Projects
* Modern React Frontends
* Spring Boot REST APIs
* Responsive User Interfaces
* Real-World Application Development
* Industry-Oriented Project Structure

---

# 📬 Connect With Me

**Abhik Mukherjee**

* GitHub: https://github.com/Abhik-08
* LinkedIn: https://www.linkedin.com/in/abhik-mukherjee-b6a15920a

---

⭐ If you found this repository helpful, consider giving it a star.
>>>>>>> 37afe53a6c0f1117b52241dde0012272d6e5d7dd
