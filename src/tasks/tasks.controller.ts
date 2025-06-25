import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, GenerateTasksDto } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate tasks using AI for a given topic' })
  @ApiResponse({ status: 200, description: 'Tasks generated successfully' })
  async generateTasks(@Request() req, @Body() generateTasksDto: GenerateTasksDto) {
    const tasks = await this.tasksService.generateTasks(req.user.id, generateTasksDto);
    return { tasks, topic: generateTasksDto.topic };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  async create(@Request() req, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.createTask(req.user.id, createTaskDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple tasks at once' })
  @ApiResponse({ status: 201, description: 'Tasks created successfully' })
  async createMultiple(@Request() req, @Body() createTasksDto: CreateTaskDto[]) {
    return this.tasksService.createMultipleTasks(req.user.id, createTasksDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks for the current user' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  async findAll(@Request() req) {
    return this.tasksService.findAllUserTasks(req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get task statistics for the current user' })
  @ApiResponse({ status: 200, description: 'Task statistics retrieved successfully' })
  async getStats(@Request() req) {
    return this.tasksService.getTaskStats(req.user.id);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get tasks grouped by category' })
  @ApiResponse({ status: 200, description: 'Tasks by category retrieved successfully' })
  async getTasksByCategory(@Request() req) {
    return this.tasksService.getTasksByCategory(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific task by ID' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.tasksService.findTaskById(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async update(@Request() req, @Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.updateTask(req.user.id, id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 204, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async remove(@Request() req, @Param('id') id: string) {
    return this.tasksService.deleteTask(req.user.id, id);
  }
}
