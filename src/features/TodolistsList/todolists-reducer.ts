import {todolistsAPI, TodolistType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {RequestStatusType, SetAppErrorActionType, setAppStatusAC, SetAppStatusActionType} from '../../app/app-reducer'
import {handleServerNetworkError} from '../../utils/error-utils'
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState: Array<TodolistDomainType> = []

const slice = createSlice({
    name:"todolist",
    initialState:initialState,
    reducers:{
        removeTodolistAC(state, action:PayloadAction<{ id: string }>){
           const index=state.findIndex(tl=>tl.id===action.payload.id)
            if (index !==-1){
                state.splice(index,1)
            }
        },
      addTodolistAC(state,action:PayloadAction<{ todolist: TodolistType}>){
state.push({...action.payload.todolist, filter:"all", entityStatus:"idle"})
      },
        changeTodolistFilterAC(state , action:PayloadAction<{ id: string, filter: FilterValuesType}>){
            const index=state.findIndex(tl=>tl.id===action.payload.id)
            if (index !==-1){
                state[index].filter= action.payload.filter
        }
        },
        changeTodolistEntityStatusAC(state , action:PayloadAction<{id: string, status: RequestStatusType}>){
            const index=state.findIndex(tl=>tl.id===action.payload.id)
            if (index !==-1){
                state[index].entityStatus= action.payload.status

            }
          } ,
        setTodolistsAC(state , action:PayloadAction<{todolists: Array<TodolistType>}>){
return action.payload.todolists.map(tl=>({...tl, filter:"all", entityStatus:"idle"}))
        },
        changeTodolistTitleAC(state , action:PayloadAction<{id: string, title: string}>){
            const index=state.findIndex(tl=>tl.id===action.payload.id)
            if (index !==-1){
                state[index].title= action.payload.title

            }
            }
    }
})
export const todolistsReducer = slice.reducer

// thunks

export const {changeTodolistFilterAC,changeTodolistEntityStatusAC,setTodolistsAC,removeTodolistAC,addTodolistAC,changeTodolistTitleAC} = slice.actions
export const fetchTodolistsTC = () => {
    return (dispatch: ThunkDispatch) => {
        dispatch(setAppStatusAC({status:'loading'}))
        todolistsAPI.getTodolists()
            .then((res) => {
                dispatch(setTodolistsAC({todolists:res.data}))
                dispatch(setAppStatusAC({status:'succeeded'}))
            })
            .catch(error => {
                handleServerNetworkError(error, dispatch);
            })
    }
}
export const removeTodolistTC = (todolistId: string) => {
    return (dispatch: ThunkDispatch) => {
        //?????????????? ???????????????????? ???????????? ????????????????????, ?????????? ???????????? ???????????? ????????????????
        dispatch(setAppStatusAC({status:'loading'}))
        //?????????????? ???????????? ?????????????????????? ??????????????????, ?????????? ???? ?????? ?????????????????????? ?????? ????????
        dispatch(changeTodolistEntityStatusAC({id:todolistId, status:'loading'}))
        todolistsAPI.deleteTodolist(todolistId)
            .then((res) => {
                dispatch(removeTodolistAC({id:todolistId}))
                //???????????? ?????????????????? ????????????????????, ?????? ?????????????????????? ???????????????? ??????????????????
                dispatch(setAppStatusAC({status:'succeeded'}))
            })
    }
}
export const addTodolistTC = (title: string) => {
    return (dispatch: ThunkDispatch) => {
        dispatch(setAppStatusAC({status:'loading'}))
        todolistsAPI.createTodolist(title)
            .then((res) => {
                dispatch(addTodolistAC({todolist:res.data.data.item}))
                dispatch(setAppStatusAC({status:'succeeded'}))
            })
    }
}
export const changeTodolistTitleTC = (id: string, title: string) => {
    return (dispatch: Dispatch<ActionsType>) => {
        todolistsAPI.updateTodolist(id, title)
            .then((res) => {
                dispatch(changeTodolistTitleAC({id:id, title:title}))
            })
    }
}

// types
export type AddTodolistActionType = ReturnType<typeof addTodolistAC>;
export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>;
export type SetTodolistsActionType = ReturnType<typeof setTodolistsAC>;
type ActionsType =
    | RemoveTodolistActionType
    | AddTodolistActionType
    | ReturnType<typeof changeTodolistTitleAC>
    | ReturnType<typeof changeTodolistFilterAC>
    | SetTodolistsActionType
    | ReturnType<typeof changeTodolistEntityStatusAC>
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}
type ThunkDispatch = Dispatch<ActionsType | SetAppStatusActionType | SetAppErrorActionType>
