//useScore hook
import { useState } from 'react';
import { useStore } from '@/store/store';

export const useScore = () => {
    const { score, setScore, addScore, kills, addKills } = useStore();
    return { score, setScore, addScore, kills, addKills };
}