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
  } from '@nestjs/common';
  import { RecurringExpensesService } from './recurring-expense.service';
  import { CreateRecurringExpenseDto } from './dto/create-recurring-expense.dto';
  import { UpdateRecurringExpenseDto } from './dto/update-recurring-expense.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  
  @Controller('recurring-expenses')
  @UseGuards(JwtAuthGuard)
  export class RecurringExpensesController {
    constructor(private readonly recurringExpensesService: RecurringExpensesService) {}
  
    @Post()
    create(@Request() req, @Body() createRecurringExpenseDto: CreateRecurringExpenseDto) {
      return this.recurringExpensesService.create(req.user.id, createRecurringExpenseDto);
    }
  
    @Get()
    findAll(@Request() req) {
      return this.recurringExpensesService.findAll(req.user.id);
    }
  
    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
      return this.recurringExpensesService.findOne(req.user.id, id);
    }
  
    @Patch(':id')
    update(
      @Request() req,
      @Param('id') id: string,
      @Body() updateRecurringExpenseDto: UpdateRecurringExpenseDto,
    ) {
      return this.recurringExpensesService.update(req.user.id, id, updateRecurringExpenseDto);
    }
  
    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
      return this.recurringExpensesService.remove(req.user.id, id);
    }
  }