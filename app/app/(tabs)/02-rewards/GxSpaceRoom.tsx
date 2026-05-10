import React from 'react';
import GxSpaceRoomView from './GxSpaceRoom.view';
import { useGxSpaceRoom } from './GxSpaceRoom.logic';

interface GxSpaceRoomProps {
  points: number;
  setPoints: React.Dispatch<React.SetStateAction<number>>;
}

export default function GxSpaceRoom({ points, setPoints }: GxSpaceRoomProps) {
  const logic = useGxSpaceRoom(points, setPoints as any);
  return <GxSpaceRoomView {...logic} points={points} setPoints={setPoints} />;
}
