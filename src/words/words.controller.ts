import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { WordsService } from './words.service';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../auth/guards/role.guards';
import { Roles } from '../auth/decorators/role.decorator';
import { Role } from '../auth/enums/role.enums';

@ApiTags('Words')
@Controller('words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Post()
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Create a new word (Admin only)',
    description: `
      Add a new word to the vocabulary library for AR scanning and phonics practice.
      
      **Requirements:**
      - Admin authentication required
      - Must include word lemma, translation, phonemes array, and audio URL
      - Assign to a category (classroom, kitchen, colors, etc.)
      - Specify age level (4-6, 7-9, or 10-12)
      
      **Example Use Cases:**
      - Adding seasonal vocabulary (winter, snow, mittens)
      - Expanding classroom objects (desk, chair, board)
      - Cultural items for special packs
      
      **Phonemes Format:**
      Use IPA phonetic notation: ["k", "æ", "t"] for "cat"
    `
  })
  @ApiBody({ 
    type: CreateWordDto,
    examples: {
      classroom: {
        summary: 'Classroom object',
        value: {
          lemma: 'desk',
          translation: 'bureau',
          phonemes: ['d', 'ɛ', 's', 'k'],
          audioUrl: 'https://cdn.example.com/audio/desk.mp3',
          illustrationUrl: 'https://cdn.example.com/img/desk.png',
          category: 'classroom',
          level: '4-6',
          language: 'en'
        }
      },
      color: {
        summary: 'Color word',
        value: {
          lemma: 'blue',
          translation: 'bleu',
          phonemes: ['b', 'l', 'u'],
          audioUrl: 'https://cdn.example.com/audio/blue.mp3',
          illustrationUrl: 'https://cdn.example.com/img/blue.png',
          category: 'colors',
          level: '4-6',
          language: 'en'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Word created successfully and added to AR vocabulary library. Returns complete word object with MongoDB ID.',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        lemma: 'desk',
        translation: 'bureau',
        phonemes: ['d', 'ɛ', 's', 'k'],
        audioUrl: 'https://cdn.example.com/audio/desk.mp3',
        illustrationUrl: 'https://cdn.example.com/img/desk.png',
        category: 'classroom',
        level: '4-6',
        language: 'en',
        isActive: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required to add words.' })
  @ApiResponse({ status: 400, description: 'Validation error - Check required fields and phonemes format.' })
  create(@Body() createWordDto: CreateWordDto) {
    return this.wordsService.create(createWordDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all words',
    description: `
      Retrieve vocabulary words with optional filtering for AR scanning and learning activities.
      
      **Filtering Options:**
      - **category**: Filter by word category (classroom, kitchen, colors, shapes, animals, etc.)
      - **level**: Filter by age group (4-6 for pre-K, 7-9 for early readers, 10-12 for intermediate)
      - **language**: Filter by target language (en, fr, ar)
      
      **Use Cases:**
      - Load words for specific Quest (e.g., "Colors Hunt" → filter by category=colors)
      - Show age-appropriate vocabulary for child profile
      - Build AR scanning database for specific room/theme
      - Generate practice sets for lessons
      
      **Response:**
      Returns array of active words (isActive=true) sorted by category and lemma.
      Each word includes phonemes for Phonics Bubbles feature.
    `
  })
  @ApiQuery({ 
    name: 'category', 
    required: false, 
    description: 'Filter by category (classroom, kitchen, colors, shapes, animals, body, nature, clothes, actions, toys)',
    example: 'classroom'
  })
  @ApiQuery({ 
    name: 'level', 
    required: false, 
    enum: ['4-6', '7-9', '10-12'],
    description: 'Filter by age group: 4-6 (pre-K/K), 7-9 (grades 1-3), 10-12 (grades 4-6)',
    example: '4-6'
  })
  @ApiQuery({ 
    name: 'language', 
    required: false, 
    description: 'Filter by target language code (ISO 639-1)',
    example: 'en'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Array of words matching filters. Empty array if no matches.',
    schema: {
      example: [
        {
          _id: '507f1f77bcf86cd799439011',
          lemma: 'desk',
          translation: 'bureau',
          phonemes: ['d', 'ɛ', 's', 'k'],
          audioUrl: 'https://cdn.example.com/audio/desk.mp3',
          illustrationUrl: 'https://cdn.example.com/img/desk.png',
          category: 'classroom',
          level: '4-6',
          language: 'en',
          isActive: true
        },
        {
          _id: '507f1f77bcf86cd799439012',
          lemma: 'chair',
          translation: 'chaise',
          phonemes: ['tʃ', 'ɛ', 'r'],
          audioUrl: 'https://cdn.example.com/audio/chair.mp3',
          category: 'classroom',
          level: '4-6',
          language: 'en',
          isActive: true
        }
      ]
    }
  })
  findAll(
    @Query('category') category?: string,
    @Query('level') level?: string,
    @Query('language') language?: string,
  ) {
    return this.wordsService.findAll(category, level, language);
  }

  @Get('categories')
  @ApiOperation({ 
    summary: 'Get all word categories',
    description: `
      Retrieve all available word categories for organizing vocabulary and building quests.
      
      **Categories Include:**
      - **Classroom**: desk, chair, board, book, pencil
      - **Kitchen**: spoon, cup, plate, fork, table
      - **Colors**: red, blue, green, yellow, orange
      - **Shapes**: circle, square, triangle, rectangle
      - **Animals**: cat, dog, bird, fish, rabbit
      - **Body**: hand, foot, eye, nose, mouth
      - **Nature**: tree, flower, sun, cloud, rain
      - **Clothes**: shirt, pants, shoes, hat, dress
      - **Actions**: run, jump, eat, drink, read
      - **Toys**: ball, doll, blocks, puzzle, car
      
      **Use Cases:**
      - Populate category selector in Quest Builder
      - Display available themes for parents/teachers
      - Generate category-based learning paths
      - Build themed AR scavenger hunts
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Array of active categories sorted by display order.',
    schema: {
      example: [
        {
          _id: '507f1f77bcf86cd799439020',
          name: 'classroom',
          description: 'Objects found in a classroom',
          iconUrl: 'https://cdn.example.com/icons/classroom.svg',
          order: 1,
          isActive: true
        },
        {
          _id: '507f1f77bcf86cd799439021',
          name: 'colors',
          description: 'Basic color words',
          iconUrl: 'https://cdn.example.com/icons/colors.svg',
          order: 2,
          isActive: true
        }
      ]
    }
  })
  getCategories() {
    return this.wordsService.getAllCategories();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get word by ID',
    description: `
      Retrieve detailed information for a specific word by MongoDB ObjectId.
      
      **Returns:**
      - Complete word data including phonemes for Phonics Bubbles
      - Audio URL for pronunciation playback
      - Illustration for AR visualization
      - Category and level assignments
      
      **Use Cases:**
      - Display word details after AR scan
      - Load pronunciation data for Phonics Bubbles
      - Show word card in learning interface
      - Reference word in story generation
    `
  })
  @ApiParam({ 
    name: 'id', 
    description: 'MongoDB ObjectId of the word',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Word details retrieved successfully.',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        lemma: 'cat',
        translation: 'chat',
        phonemes: ['k', 'æ', 't'],
        audioUrl: 'https://cdn.example.com/audio/cat.mp3',
        illustrationUrl: 'https://cdn.example.com/img/cat.png',
        category: 'animals',
        level: '4-6',
        language: 'en',
        isActive: true,
        createdAt: '2024-01-15T10:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Word not found with provided ID.' })
  findOne(@Param('id') id: string) {
    return this.wordsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Update word (Admin only)',
    description: `
      Modify existing word properties including translations, phonemes, audio, or metadata.
      
      **Updatable Fields:**
      - lemma, translation (text changes)
      - phonemes (pronunciation refinements)
      - audioUrl, illustrationUrl (media updates)
      - category, level (reorganization)
      - language (localization)
      
      **Common Updates:**
      - Fix phoneme transcriptions based on testing
      - Replace audio files with better recordings
      - Update translations for accuracy
      - Reassign words to different categories
      - Change level based on difficulty feedback
      
      **Note:** Partial updates supported - only send fields to change.
    `
  })
  @ApiParam({ name: 'id', description: 'Word ID to update' })
  @ApiBody({ type: UpdateWordDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Word updated successfully. Returns updated word object.',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        lemma: 'cat',
        translation: 'chat',
        phonemes: ['k', 'æ', 't'],
        audioUrl: 'https://cdn.example.com/audio/cat_v2.mp3',
        category: 'animals',
        level: '4-6',
        updatedAt: '2024-01-20T14:20:00Z'
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required.' })
  @ApiResponse({ status: 404, description: 'Word not found.' })
  update(@Param('id') id: string, @Body() updateWordDto: UpdateWordDto) {
    return this.wordsService.update(id, updateWordDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Delete word (Admin only)',
    description: `
      Soft-delete a word by setting isActive=false. Word remains in database but won't appear in queries.
      
      **Behavior:**
      - Word is hidden from AR scanning
      - Removed from quest generation
      - Excluded from lesson plans
      - Historical scan events preserved
      - Can be reactivated later if needed
      
      **When to Delete:**
      - Seasonal words out of season
      - Culturally inappropriate content
      - Duplicate entries
      - Testing/development words
      
      **Hard Delete:** Contact database admin for permanent removal (rare).
    `
  })
  @ApiParam({ name: 'id', description: 'Word ID to delete' })
  @ApiResponse({ 
    status: 200, 
    description: 'Word soft-deleted successfully (isActive set to false).',
    schema: {
      example: {
        message: 'Word deleted successfully'
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required.' })
  @ApiResponse({ status: 404, description: 'Word not found.' })
  remove(@Param('id') id: string) {
    return this.wordsService.remove(id);
  }
}
