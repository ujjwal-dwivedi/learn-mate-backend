import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { db, tasks, Task, NewTask } from '../database';
import { CreateTaskDto, UpdateTaskDto, GenerateTasksDto } from './dto/task.dto';
import { GeminiService } from '../gemini/gemini.service';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class TasksService {
  constructor(private geminiService: GeminiService) {}

  async generateTasks(userId: string, generateTasksDto: GenerateTasksDto): Promise<string[]> {
    const { topic } = generateTasksDto;
    return this.geminiService.generateTasksWithFallback(topic);
  }

  async createTask(userId: string, createTaskDto: CreateTaskDto): Promise<Task> {
    const newTask: NewTask = {
      ...createTaskDto,
      userId,
      completed: false,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
    };

    const [task] = await db.insert(tasks).values(newTask).returning();
    return task;
  }

  async createMultipleTasks(userId: string, tasksData: CreateTaskDto[]): Promise<Task[]> {
    const newTasks: NewTask[] = tasksData.map(taskData => ({
      ...taskData,
      userId,
      completed: false,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
    }));

    const createdTasks = await db.insert(tasks).values(newTasks).returning();
    return createdTasks;
  }

  async findAllUserTasks(userId: string): Promise<Task[]> {
    return db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async findTaskById(userId: string, taskId: string): Promise<Task> {
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .limit(1);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async updateTask(userId: string, taskId: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    // First check if task exists and belongs to user
    await this.findTaskById(userId, taskId);

    const updateData: any = {
      ...updateTaskDto,
      updatedAt: new Date(),
    };

    if (updateTaskDto.dueDate) {
      updateData.dueDate = new Date(updateTaskDto.dueDate);
    }

    const [updatedTask] = await db
      .update(tasks)
      .set(updateData)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();

    if (!updatedTask) {
      throw new NotFoundException('Task not found');
    }

    return updatedTask;
  }

  async deleteTask(userId: string, taskId: string): Promise<void> {
    // First check if task exists and belongs to user
    await this.findTaskById(userId, taskId);

    const result = await db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();

    if (result.length === 0) {
      throw new NotFoundException('Task not found');
    }
  }

  async getTaskStats(userId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
  }> {
    const userTasks = await this.findAllUserTasks(userId);
    const total = userTasks.length;
    const completed = userTasks.filter(task => task.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      completionRate,
    };
  }

  async getTasksByCategory(userId: string): Promise<Record<string, Task[]>> {
    const userTasks = await this.findAllUserTasks(userId);
    const tasksByCategory: Record<string, Task[]> = {};

    userTasks.forEach(task => {
      const category = task.category || 'uncategorized';
      if (!tasksByCategory[category]) {
        tasksByCategory[category] = [];
      }
      tasksByCategory[category].push(task);
    });

    return tasksByCategory;
  }
}
