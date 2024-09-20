import { Employee } from "../interfaces/odoo";
import { useState } from "react";

interface EmployeeCardProps {
    employee: Employee,
    question: string,
    choices: string[],
    answerIdx: number,
    onAnswer: (isCorrect: boolean) => void,
    onSkip: () => void,
}

export function EmployeeCard({ employee, question, choices, answerIdx, onAnswer, onSkip }: EmployeeCardProps) {
    const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const handleAnswer = (choiceIdx: number) => {
        if (choiceIdx === -1) return onSkip();
        const isCorrect = choiceIdx === answerIdx;
        setIsCorrect(isCorrect);
        setSelectedChoice(choiceIdx);
        setTimeout(() => {
            onAnswer(isCorrect);
        }, 1500);
    };

    const getBgColorName = (idx: number): string => {
        if (selectedChoice === null) return 'bg-gray-200';
        if (idx === answerIdx) return 'bg-green-200';
        if (selectedChoice === idx && !isCorrect) return 'bg-red-200';
        return 'bg-gray-200';
    }

    return (
        <div className="flex flex-col items-center gap-4 p-2 flex-grow">
            <img src={employee.avatarUrl} alt={employee.name} className="w-1/2 rounded-full aspect-square object-cover" />
            <div className="text-gray-700 flex flex-col gap-1 text-center">
                <span>{employee.jobTitle}</span>
                <span>{employee.departmentName}</span>
            </div>
            <p className="font-medium text-lg">{question}</p>
            <div className="flex flex-col gap-2 w-full">
                {choices.map((choice, idx) => (
                    <button
                        key={employee.id * idx}
                        id={`choice-${idx}`}
                        className={`${getBgColorName(idx)} text-gray-800 font-bold py-2 px-4 rounded w-full`}
                        onClick={() => handleAnswer(idx)}
                        disabled={selectedChoice !== null}
                    >
                        {choice}
                    </button>
                ))}
            </div>
        </div>
    );
}