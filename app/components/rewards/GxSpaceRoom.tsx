import React from 'react';
import GxSpaceRoomView from './GxSpaceRoom.view';
import { useGxSpaceRoom } from './GxSpaceRoom.logic';
import { useRewards } from './context';

interface GxSpaceRoomProps {
  points: number;
  setPoints: React.Dispatch<React.SetStateAction<number>>;
}

export default function GxSpaceRoom({ points, setPoints }: GxSpaceRoomProps) {
  const rewards = useRewards();
  const logic = useGxSpaceRoom(points, setPoints as any, rewards);
  return <GxSpaceRoomView {...logic} points={points} setPoints={setPoints} />;
}
