import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    Req,
    Logger,
  } from '@nestjs/common';
  import { RecurringExpensesService } from './recurring-expenses.service';
  import { CreateRecurringExpenseDto } from './dto/create-recurring-expense.dto';
  import { UpdateRecurringExpenseDto } from './dto/update-recurring-expense.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { Request } from 'express';
  import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
  import { FilterRecurringExpenseDto } from './dto/filter-recurring-expense.dto';
  
  interface RequestWithUser extends Request {
    user: {
      id: string;
      email: string;
    };
  }
  
  @Controller('recurring-expenses')
  @UseGuards(JwtAuthGuard)
  export class RecurringExpensesController {
    private readonly logger = new Logger(RecurringExpensesController.name);
  
    constructor(private readonly recurringExpensesService: RecurringExpensesService) {}
  
    @Post()
    async create(@Req() req: RequestWithUser, @Body() createRecurringExpenseDto: CreateRecurringExpenseDto) {
      try {
        console.log('User from request:', req.user);
        if (!req.user || !req.user.id) {
          throw new Error('User ID not found in request');
        }
        return await this.recurringExpensesService.create(req.user.id, createRecurringExpenseDto);
      } catch (error) {
        this.logger.error(`Error in create recurring expense: ${error.message}`, error.stack);
        throw error;
      }
    }
  
    @Get()
    async findAll(
      @Req() req: RequestWithUser,
      @Query('page') page?: string,
      @Query('limit') limit?: string,
      @Query('category') category?: string,
      @Query('minAmount') minAmount?: string,
      @Query('maxAmount') maxAmount?: string,
      @Query('isActive') isActive?: string,
    ) {
      try {
        console.log('User from request in findAll:', req.user);
        if (!req.user || !req.user.id) {
          throw new Error('User ID not found in request');
        }
        
        // Create pagination query object
        const paginationQuery: PaginationQueryDto = {};
        if (page) paginationQuery.page = parseInt(page, 10);
        if (limit) paginationQuery.limit = parseInt(limit, 10);
        
        // Create filter query object
        const filterDto: FilterRecurringExpenseDto = {};
        if (category) filterDto.category = category;
        if (minAmount) filterDto.minAmount = parseFloat(minAmount);
        if (maxAmount) filterDto.maxAmount = parseFloat(maxAmount);
        if (isActive) filterDto.isActive = isActive.toLowerCase() === 'true';

        return await this.recurringExpensesService.findAll(req.user.id, paginationQuery, filterDto);
      } catch (error) {
        this.logger.error(`Error in findAll recurring expenses: ${error.message}`, error.stack);
        throw error;
      }
    }
  
    @Get(':id')
    findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
      return this.recurringExpensesService.findOne(req.user.id, id);
    }
  
    @Patch(':id')
    update(
      @Req() req: RequestWithUser,
      @Param('id') id: string,
      @Body() updateRecurringExpenseDto: UpdateRecurringExpenseDto,
    ) {
      return this.recurringExpensesService.update(req.user.id, id, updateRecurringExpenseDto);
    }
  
    @Delete(':id')
    remove(@Req() req: RequestWithUser, @Param('id') id: string) {
      return this.recurringExpensesService.remove(req.user.id, id);
    }
  }