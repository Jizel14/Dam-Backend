import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz } from './schemas/quiz.schema';
import { QuizAttempt } from './schemas/quiz-attempt.schema';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>,
    @InjectModel(QuizAttempt.name) private quizAttemptModel: Model<QuizAttempt>,
  ) {}

  async create(userId: string, createQuizDto: CreateQuizDto): Promise<Quiz> {
    // Add unique IDs to questions
    const questionsWithIds = createQuizDto.questions.map(q => ({
      ...q,
      id: uuidv4(),
    }));

    const quiz = await this.quizModel.create({
      ...createQuizDto,
      questions: questionsWithIds,
      createdBy: userId,
    });

    return quiz.populate('lessonId');
  }

  async findAll(level?: string): Promise<Quiz[]> {
    const filter: any = { isActive: true };
    if (level) filter.level = level;

    return this.quizModel.find(filter).populate('lessonId').populate('createdBy', 'name').sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Quiz> {
    const quiz = await this.quizModel.findById(id).populate('lessonId').exec();
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    return quiz;
  }

  async findByTeacher(teacherId: string): Promise<Quiz[]> {
    return this.quizModel.find({ createdBy: teacherId, isActive: true }).populate('lessonId').sort({ createdAt: -1 }).exec();
  }

  async submitQuiz(quizId: string, submitQuizDto: SubmitQuizDto): Promise<QuizAttempt> {
    const quiz = await this.quizModel.findById(quizId).exec();
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Grade answers
    const gradedAnswers = submitQuizDto.answers.map(answer => {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      if (!question) {
        return { ...answer, isCorrect: false, points: 0 };
      }

      const isCorrect = answer.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
      return {
        questionId: answer.questionId,
        answer: answer.answer,
        isCorrect,
        points: isCorrect ? question.points : 0,
      };
    });

    const score = gradedAnswers.reduce((sum, a) => sum + a.points, 0);
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

    const attempt = await this.quizAttemptModel.create({
      quizId,
      childId: submitQuizDto.childId,
      answers: gradedAnswers,
      score,
      totalPoints,
      completedAt: new Date(),
      timeSpent: submitQuizDto.timeSpent,
    });

    return attempt;
  }

  async getChildAttempts(childId: string): Promise<QuizAttempt[]> {
    return this.quizAttemptModel.find({ childId }).populate('quizId').sort({ createdAt: -1 }).exec();
  }

  async getQuizAttempts(quizId: string): Promise<QuizAttempt[]> {
    return this.quizAttemptModel.find({ quizId }).populate('childId').sort({ createdAt: -1 }).exec();
  }

  async remove(id: string, userId: string, userRoles: string[]): Promise<{ message: string }> {
    const quiz = await this.quizModel.findById(id).exec();
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.createdBy.toString() !== userId && !userRoles.includes('admin')) {
      throw new ForbiddenException('You can only delete your own quizzes');
    }

    await this.quizModel.findByIdAndUpdate(id, { isActive: false }).exec();
    return { message: 'Quiz deleted successfully' };
  }
}
