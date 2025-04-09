# <img src="frontend/public/favicon.ico" alt="Logo" width="30" /> Markdown Converter

A powerful tool that converts images/text into Markdown format, supporting multiple input methods and output languages. You can try it out [Here](https://img2markdown.vercel.app/).

## Features

- **Multiple Input Methods**
  - Paste an image directly (Ctrl + V)
  - Upload an image file
  - Enter a text description

- **Multi-language Support**
  - Supports output in English and Chinese
  - Automatically detects image content

- **Instant Preview**
  - Preview raw Markdown code
  - Preview rendered Markdown output

- **History Records**
  - Automatically saves conversion history
  - View historical records
  - Supports deleting historical records

- **User Authentication**
  - User registration and login
  - Secure authentication
  - Personalized history records

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Axios
- React Markdown
- React Router

### Backend
- Python
- FastAPI
- SQLAlchemy
- JWT Authentication
- OpenAI API

## How to Use

1. **Register/Login**
   - Visit the application and register a new account
   - Log in using the registered account

2. **Convert Images**
   - Use Ctrl + V to paste an image
   - Or click "Select Image" to upload an image
   - Choose the output language (English/Chinese)
   - Click "Convert" to start the conversion

3. **View Results**
   - View the converted Markdown raw code
   - Preview the rendered Markdown effect
   - Copy the Markdown content

4. **Manage History Records**
   - View all conversion records on the History page
   - Expand/collapse raw code and preview
   - Delete unnecessary records
