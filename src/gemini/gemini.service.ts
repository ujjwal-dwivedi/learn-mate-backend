import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('gemini.apiKey');
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateTasks(topic: string): Promise<string[]> {
    if (!topic || topic.trim().length === 0) {
      throw new BadRequestException('Topic cannot be empty');
    }

    try {
      const prompt = `Generate a list of 5 concise, actionable tasks to learn about ${topic}. 
      Each task should be:
      - Specific and actionable
      - Suitable for a beginner to intermediate learner
      - Between 5-15 words long
      - Focused on practical learning
      
      Return only the tasks, one per line, without numbering or formatting.
      
      Example format:
      Complete an online course on basics
      Practice with hands-on exercises
      Build a simple project
      Read documentation and tutorials
      Join a community or forum`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the response to extract tasks
      const tasks = text
        .split('\n')
        .map(task => task.trim())
        .filter(task => task.length > 0 && !task.match(/^\d+\.?/) && task !== '')
        .slice(0, 5); // Ensure we only get 5 tasks

      if (tasks.length === 0) {
        throw new InternalServerErrorException('Failed to generate tasks from AI response');
      }

      return tasks;
    } catch (error) {
      console.error('Error generating tasks with Gemini:', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Fallback tasks if AI fails
      throw new InternalServerErrorException('Failed to generate tasks. Please try again.');
    }
  }

  async generateTasksWithFallback(topic: string): Promise<string[]> {
    try {
      return await this.generateTasks(topic);
    } catch (error) {
      // Fallback to predefined tasks if AI fails
      console.warn('Falling back to predefined tasks due to AI error:', error.message);
      
      const fallbackTasks = [
        `Research the fundamentals of ${topic}`,
        `Find and bookmark key resources about ${topic}`,
        `Practice basic concepts of ${topic}`,
        `Create a simple project using ${topic}`,
        `Join a community focused on ${topic}`,
      ];
      
      return fallbackTasks;
    }
  }
}
