# LingoQuest Kids Backend API

🎮 AR Language Learning Platform for Kids (4-12 years)

## Project Structure

```
src/
 ├── auth/
 │    ├── auth.controller.ts
 │    ├── auth.service.ts
 │    ├── mail.service.ts
 │    ├── jwt.strategy.ts
 │    ├── dto/
 │    │    ├── signup.dto.ts
 │    │    ├── signup-parent.dto.ts
 │    │    ├── signup-teacher.dto.ts
 │    │    ├── create-kid.dto.ts
 │    │    ├── login.dto.ts
 │    │    ├── create-admin.dto.ts
 │    │    ├── forgot-password.dto.ts
 │    │    ├── verify-otp.dto.ts
 │    │    └── reset-password.dto.ts
 │    ├── schemas/
 │    │    ├── user.schema.ts
 │    │    └── otp.schema.ts
 │    ├── guards/
 │    │    └── role.guards.ts
 │    ├── decorators/
 │    │    └── role.decorator.ts
 │    └── enums/
 │         └── role.enums.ts
 ├── words/
 │    ├── words.controller.ts
 │    ├── words.service.ts
 │    ├── schemas/
 │    │    ├── word.schema.ts
 │    │    └── category.schema.ts
 │    └── dto/
 │         ├── create-word.dto.ts
 │         └── update-word.dto.ts
 ├── children/
 │    ├── children.controller.ts
 │    ├── children.service.ts
 │    ├── schemas/
 │    │    └── child-profile.schema.ts
 │    └── dto/
 │         ├── create-child-profile.dto.ts
 │         └── update-child-profile.dto.ts
 ├── stories/
 │    ├── stories.controller.ts
 │    ├── stories.service.ts
 │    ├── schemas/
 │    │    └── story.schema.ts
 │    └── dto/
 │         └── create-story.dto.ts
 ├── quests/
 │    ├── quests.controller.ts
 │    ├── quests.service.ts
 │    ├── schemas/
 │    │    ├── quest.schema.ts
 │    │    └── quest-progress.schema.ts
 │    └── dto/
 │         └── create-quest.dto.ts
 ├── progress/
 │    ├── progress.controller.ts
 │    ├── progress.service.ts
 │    ├── schemas/
 │    │    └── scan-event.schema.ts
 │    └── dto/
 │         └── create-scan-event.dto.ts
 ├── lessons/
 │    ├── lessons.controller.ts
 │    ├── lessons.service.ts
 │    ├── schemas/
 │    │    └── lesson.schema.ts
 │    └── dto/
 │         ├── create-lesson.dto.ts
 │         └── update-lesson.dto.ts
 ├── quizzes/
 │    ├── quizzes.controller.ts
 │    ├── quizzes.service.ts
 │    ├── schemas/
 │    │    ├── quiz.schema.ts
 │    │    └── quiz-attempt.schema.ts
 │    └── dto/
 │         ├── create-quiz.dto.ts
 │         └── submit-quiz.dto.ts
 ├── twin-talk/
 │    ├── twin-talk.controller.ts
 │    ├── twin-talk.service.ts
 │    ├── schemas/
 │    │    └── twin-session.schema.ts
 │    └── dto/
 │         ├── create-session.dto.ts
 │         ├── join-session.dto.ts
 │         └── complete-round.dto.ts
 ├── main.ts
 └── app.module.ts
```

## Features

- 🔐 **Multi-role Authentication** (Admin, Teacher, Parent, Kid)
- 📚 **Word Library** with AR scanning support
- 👨‍👩‍👧 **Child Profile Management** with XP & Pet Building
- 📖 **AI Story Generation** from scanned objects
- 🎯 **Classroom Quest Builder** for teachers
- 🏆 **Progress Tracking** & Analytics
- 📝 **Lessons & Quizzes** management
- 👫 **Twin-Talk** co-play sessions
- 📧 **Email** (OTP, Welcome, Password Reset)

## Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + Passport
- **Email**: Nodemailer
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file:

```env
# Database
DB_URI=mongodb://localhost:27017/LingoQuestKids

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h

# App
PORT=3000

# SMTP Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

## Running the App

```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

## API Documentation

Access Swagger docs at: `http://localhost:3000/api`

## Roles & Permissions

- **Admin**: Full system access
- **Teacher**: Create lessons, quizzes, quests; view student progress
- **Parent**: Manage kid profiles, set controls, view progress
- **Kid**: Limited access, managed by parents

## Project Timeline (6 weeks)

- Week 1: AR Scan & Label, content packs
- Week 2: Phonics Bubbles
- Week 3: AI Story Blocks
- Week 4: Twin-Talk co-play
- Week 5: Parent Dashboard & Quest Builder
- Week 6: QA, security, beta testing

## License

Private - LingoQuest Kids © 2024
