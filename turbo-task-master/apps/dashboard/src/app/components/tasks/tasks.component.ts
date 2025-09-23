import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MasterService } from '../../_service/master.service';
import { task } from '../../_model/task';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-task',
  imports: [CommonModule, TableModule,TagModule,ButtonModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TaskComponent implements OnInit {
  tasklist!: task[];
  constructor(private service: MasterService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks() {
    this.service.Loadtasks().subscribe((item) => {
      console.log(item);
   
    // this.tasklist = item;
    });
  }
}
