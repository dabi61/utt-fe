import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Sử dụng cho dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Sử dụng cho selector với kiểu RootState
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 