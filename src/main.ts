import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation pipe - allow extra properties for DTOs with inheritance
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Changed to false to allow extra properties
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('LingoQuest Kids API')
    .setDescription(`
      🎮 **LingoQuest Kids Backend API** - AR Language Learning Platform
      
      ## Overview
      Complete REST API for the LingoQuest Kids mobile application featuring:
      - 🔐 **Multi-role Authentication** (Admin, Teacher, Parent, Kid)
      - 📚 **Word Library** with AR scanning & Phonics Bubbles
      - 👨‍👩‍👧 **Child Profile Management** with XP & Pet Building
      - 📖 **AI Story Generation** from scanned objects
      - 🎯 **Classroom Quest Builder** for teachers
      - 🏆 **Progress Tracking** & Analytics
      - 📝 **Lessons & Quizzes** management
      - 👫 **Twin-Talk** co-play sessions
      
      ## Authentication
      Most endpoints require JWT authentication. Use the \`/auth/login\` endpoint to obtain a token.
      
      ## Roles & Permissions
      - **Admin**: Full system access
      - **Teacher**: Create lessons, quizzes, quests; view student progress
      - **Parent**: Manage kid profiles, set controls, view progress
      - **Kid**: Limited access, managed by parents
    `)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User registration, login, password management')
    .addTag('Words', 'Vocabulary management and AR scanning')
    .addTag('Children', 'Child profile management and XP tracking')
    .addTag('Stories', 'AI-generated stories from scanned objects')
    .addTag('Quests', 'Classroom quest builder and tracking')
    .addTag('Progress', 'Learning analytics and scan events')
    .addTag('Lessons', 'Structured lesson plans and activities')
    .addTag('Quizzes', 'Interactive quizzes and assessments')
    .addTag('Twin-Talk', 'Co-play sessions and buddy games')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'LingoQuest Kids API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0'); // ✅ make server public within LAN
  
  console.log(`
    🚀 LingoQuest Kids API is running!
    📝 API Documentation: http://localhost:${port}/api
    🔗 Server: http://localhost:${port}
  `);
}
bootstrap();