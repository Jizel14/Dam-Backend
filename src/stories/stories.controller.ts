import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Stories')
@Controller('stories')
@UseGuards(AuthGuard())
@ApiBearerAuth('JWT-auth')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new story from scanned items',
    description: `
      🎨 **AI Story Blocks**: Generate a personalized story from 3-4 scanned objects using AI.
      
      **How It Works:**
      1. Kid scans 3-4 real objects with AR (e.g., cat, table, hat, milk)
      2. App sends word IDs to this endpoint
      3. AI generates age-appropriate story (4-6 sentences) including ALL items
      4. Story narrated with TTS + optional SFX
      5. Saved to child's story collection
      
      **AI Constraints (Guardrails):**
      - Length: 4-6 sentences maximum
      - Vocabulary: CEFR A1/A2 level only
      - Content: Kid-safe, positive themes
      - Inclusion: MUST use all 3-4 scanned items
      - Grammar: Simple present/past, age-appropriate
      
      **Story Modes:**
      - **narration**: App reads complete story with sound effects
      - **finish**: Story stops at cliffhanger; kid records ending (≤10s audio)
      
      **Example Generated Story:**
      Items: [cat, table, hat, milk]
      → "Once there was a cat wearing a funny hat. The cat jumped on the table and knocked over a glass of milk. What a mess!"
      
      **Offline Fallback:**
      If no internet, uses pre-written templates with item placeholders.
    `
  })
  @ApiBody({ 
    type: CreateStoryDto,
    examples: {
      narration: {
        summary: 'Narration mode (app reads story)',
        value: {
          childId: '507f1f77bcf86cd799439011',
          items: [
            '507f1f77bcf86cd799439020',
            '507f1f77bcf86cd799439021',
            '507f1f77bcf86cd799439022'
          ],
          mode: 'narration'
        }
      },
      finish: {
        summary: 'Finish-the-story mode (kid completes it)',
        value: {
          childId: '507f1f77bcf86cd799439011',
          items: [
            '507f1f77bcf86cd799439020',
            '507f1f77bcf86cd799439021',
            '507f1f77bcf86cd799439022',
            '507f1f77bcf86cd799439023'
          ],
          mode: 'finish'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Story generated successfully with AI. Includes text, audio URL (TTS), and populated word objects.',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439030',
        childId: '507f1f77bcf86cd799439011',
        level: '4-6',
        items: [
          {
            _id: '507f1f77bcf86cd799439020',
            lemma: 'cat',
            translation: 'chat',
            illustrationUrl: 'https://cdn.example.com/img/cat.png'
          },
          {
            _id: '507f1f77bcf86cd799439021',
            lemma: 'table',
            translation: 'table',
            illustrationUrl: 'https://cdn.example.com/img/table.png'
          },
          {
            _id: '507f1f77bcf86cd799439022',
            lemma: 'hat',
            translation: 'chapeau',
            illustrationUrl: 'https://cdn.example.com/img/hat.png'
          }
        ],
        text: 'Once there was a cat wearing a funny hat. The cat jumped on the table and knocked over a glass of milk. What a mess! The cat licked the milk off the floor.',
        audioUrl: 'https://cdn.example.com/audio/story_030_tts.mp3',
        coverImageUrl: 'https://cdn.example.com/img/story_030_cover.png',
        mode: 'narration',
        isShared: false,
        createdAt: '2024-01-15T10:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Validation error - Must provide 3-4 items, all must be valid word IDs.' })
  @ApiResponse({ status: 500, description: 'AI generation failed - Check network or use offline fallback.' })
  create(@Body() createStoryDto: CreateStoryDto) {
    return this.storiesService.create(createStoryDto);
  }

  @Get('child/:childId')
  @ApiOperation({ 
    summary: 'Get all stories for a child',
    description: `
      Retrieve complete story collection for a child's profile, ordered by creation date (newest first).
      
      **Returns:**
      - All stories created by this child
      - Complete word objects for each story (for replay)
      - Story text and audio URLs
      - Cover images generated from first scanned item
      - Sharing status (isShared)
      
      **Use Cases:**
      - Display story library in kid's profile
      - Parent review of created stories
      - Replay past stories with narration
      - Export to picture-book format
      - Track creative progress (stories per week)
      
      **Privacy:**
      - Only accessible by child's parent or teachers
      - Shared stories visible to siblings (family sharing)
      - Audio recordings stored securely
    `
  })
  @ApiParam({ 
    name: 'childId', 
    description: 'Child profile ID (from ChildProfile collection)',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Array of stories sorted by newest first. Includes populated word objects.',
    schema: {
      example: [
        {
          _id: '507f1f77bcf86cd799439030',
          childId: '507f1f77bcf86cd799439011',
          level: '4-6',
          items: [
            { _id: '...', lemma: 'cat', illustrationUrl: '...' },
            { _id: '...', lemma: 'table', illustrationUrl: '...' },
            { _id: '...', lemma: 'hat', illustrationUrl: '...' }
          ],
          text: 'Once there was a cat...',
          audioUrl: 'https://cdn.example.com/audio/story_030.mp3',
          coverImageUrl: 'https://cdn.example.com/img/story_030_cover.png',
          mode: 'narration',
          isShared: false,
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          _id: '507f1f77bcf86cd799439031',
          childId: '507f1f77bcf86cd799439011',
          items: [/* ... */],
          text: 'In a big kitchen...',
          mode: 'finish',
          childEndingAudioUrl: 'https://cdn.example.com/audio/child_ending_031.mp3',
          isShared: true,
          createdAt: '2024-01-14T15:20:00Z'
        }
      ]
    }
  })
  findAllByChild(@Param('childId') childId: string) {
    return this.storiesService.findAllByChild(childId);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get story by ID',
    description: `
      Retrieve detailed information for a specific story including full text, audio, and word objects.
      
      **Use Cases:**
      - Replay specific story with narration
      - Display story in reading interface
      - Export to picture-book card
      - Share story with family members
      - Teacher review of student work
      
      **Data Included:**
      - Complete story text (4-6 sentences)
      - TTS audio URL for narration
      - Populated word objects with illustrations
      - Cover image (auto-generated from first item)
      - Child ending audio (if mode=finish)
      - Creation timestamp
    `
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Story MongoDB ObjectId',
    example: '507f1f77bcf86cd799439030'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Complete story details with populated items.',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439030',
        childId: '507f1f77bcf86cd799439011',
        level: '7-9',
        items: [
          {
            _id: '507f1f77bcf86cd799439020',
            lemma: 'dragon',
            translation: 'dragon',
            phonemes: ['d', 'r', 'æ', 'g', 'ə', 'n'],
            audioUrl: 'https://cdn.example.com/audio/dragon.mp3',
            illustrationUrl: 'https://cdn.example.com/img/dragon.png',
            category: 'fantasy'
          }
          // ... other items
        ],
        text: 'A brave dragon lived in a castle on a hill. One day, the dragon found a magic key under a rock. The key opened a treasure chest full of golden cookies!',
        audioUrl: 'https://cdn.example.com/audio/story_030_tts.mp3',
        coverImageUrl: 'https://cdn.example.com/img/story_030_cover.png',
        mode: 'narration',
        isShared: false,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Story not found with provided ID.' })
  findOne(@Param('id') id: string) {
    return this.storiesService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete story',
    description: `
      Permanently delete a story from child's collection. This action cannot be undone.
      
      **Behavior:**
      - Story removed from database
      - Audio files marked for cleanup (TTS + child recordings)
      - Cover images deleted
      - Story no longer appears in child's library
      
      **Who Can Delete:**
      - Child's parent
      - System admin
      - Teacher (if school-managed account)
      
      **Use Cases:**
      - Remove inappropriate content (rare with AI guardrails)
      - Clean up test stories
      - Manage storage limits
      - Child request to remove story
      
      **Note:** Consider export/backup before deletion.
    `
  })
  @ApiParam({ name: 'id', description: 'Story ID to delete' })
  @ApiResponse({ 
    status: 200, 
    description: 'Story deleted permanently from database.',
    schema: {
      example: {
        message: 'Story deleted successfully'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Story not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized to delete this story.' })
  remove(@Param('id') id: string) {
    return this.storiesService.remove(id);
  }

  @Patch(':id/share')
  @ApiOperation({ 
    summary: 'Share/unshare story',
    description: `
      Toggle story sharing status for family/classroom visibility.
      
      **Sharing Behavior:**
      - **isShared=true**: Story visible to siblings (same parent) or classmates
      - **isShared=false**: Story private to child only
      
      **Family Sharing:**
      - Siblings can listen to shared stories
      - Appears in "Family Stories" section
      - Original creator gets credit badge
      
      **Classroom Sharing:**
      - Teacher can feature shared stories
      - Appears in class story gallery
      - Encourages peer learning
      
      **Privacy:**
      - Parent must enable sharing feature
      - Child name/avatar may be displayed
      - No external sharing (privacy-safe)
      
      **Use Cases:**
      - Showcase creative work
      - Inspire other kids
      - Build confidence
      - Family story time
    `
  })
  @ApiParam({ name: 'id', description: 'Story ID to share/unshare' })
  @ApiBody({ 
    schema: { 
      type: 'object',
      properties: {
        isShared: {
          type: 'boolean',
          description: 'Set to true to share story, false to make private',
          example: true
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Story sharing status updated successfully.',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439030',
        isShared: true,
        updatedAt: '2024-01-15T11:00:00Z',
        message: 'Story is now shared with family/classroom'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Story not found.' })
  shareStory(@Param('id') id: string, @Body('isShared') isShared: boolean) {
    return this.storiesService.shareStory(id, isShared);
  }
}
