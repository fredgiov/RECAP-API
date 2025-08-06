# RECAP Custom Model API

A specialized AI learning assistant API with custom model training capabilities, designed specifically for educational environments at University of Delaware.

## Features

- Custom AI model training for educational conversations
- Real-time chat API with streaming responses
- Educational context awareness (class-specific responses)
- Role-based interactions (student, teacher, admin)
- Continuous learning from user interactions
- University of Delaware knowledge integration
- Data collection and quality improvement pipeline

## Quick Start

### 1. Installation
```bash
npm install
pip install -r requirements.txt
```

### 2. Environment Setup
```bash
cp .env.example .env
```

### 3. Initialize Database
```bash
npm run init-db
```

### 4. Generate Initial Training Data
```bash
npm run train
```

### 5. Start the API
```bash
npm start
```