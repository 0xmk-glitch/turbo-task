import { signalStore, withMethods, withState } from '@ngrx/signals'
import {CreateTaskDto} from '../../../../api/src/app/tasks/dto/create-task.dto'

export interface TaskState {
    tasks: CreateTaskDto[],
    featuredTasks: CreateTaskDto[],
    loading: boolean,
    error: string | null
}

const initialState: TaskState = {
    tasks: [],
    featuredTasks: [],
    loading:false,
    error:null
};

export const TaskStore = signalStore({
    providedIn:'root'
},
withState(initialState)
);