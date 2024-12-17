import { configureStore } from '@reduxjs/toolkit'
import userReduser from '../features/user/userSlice'
import adminReducer from '../features/admin/adminSlice'
import trainerReducer from '../features/trainer/trainerSlice'

// Redux store
const store = configureStore({
    reducer: {
        user: userReduser,
        admin: adminReducer,
        trainer: trainerReducer
    }
})

export default store

export type RootState = ReturnType<typeof store.getState>; 
export type AppDispatch = typeof store.dispatch; 