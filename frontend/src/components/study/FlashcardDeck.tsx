
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/Card";
import { Flashcard, FlashcardRating } from '@/lib/api/flashcards';
import { Button } from "@/components/ui/Button";
import { RotateCw, Check, X, FastForward, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashcardDeckProps {
    cards: Flashcard[];
    onReview: (id: number, rating: FlashcardRating) => void;
    onSessionComplete: () => void;
}

const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ cards, onReview, onSessionComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    if (cards.length === 0 || currentIndex >= cards.length) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl shadow-sm border border-slate-100">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                    <Check className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Session Complete!</h3>
                <p className="text-slate-500 mb-8 text-center max-w-xs">You've reviewed all your due cards for now. Great job!</p>
                <Button onClick={onSessionComplete} className="bg-indigo-600 hover:bg-indigo-700">
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    const currentCard = cards[currentIndex];

    const handleRating = (rating: FlashcardRating) => {
        onReview(currentCard.id, rating);
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
        }, 300);
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    Card {currentIndex + 1} of {cards.length}
                </span>
                <div className="h-1.5 w-48 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="relative h-[400px] w-full perspective-1000">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                        className="w-full h-full"
                    >
                        <div
                            className={`relative w-full h-full transition-transform duration-700 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            {/* Front Side */}
                            <Card className="absolute inset-0 backface-hidden border-2 border-slate-100 shadow-xl overflow-y-auto">
                                <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center">
                                    {currentCard.subject_details && (
                                        <span className="mb-4 px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-tighter">
                                            {currentCard.subject_details.name}
                                        </span>
                                    )}
                                    <p className="text-xl md:text-2xl font-semibold leading-relaxed text-slate-800">
                                        {currentCard.front}
                                    </p>
                                    <div className="mt-8 flex items-center gap-2 text-slate-400 animate-pulse">
                                        <RotateCw className="w-4 h-4" />
                                        <span className="text-xs font-medium">Click to flip</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Back Side */}
                            <Card className="absolute inset-0 backface-hidden border-2 border-indigo-100 shadow-xl rotate-y-180 overflow-y-auto">
                                <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center bg-indigo-50/30">
                                    <p className="text-lg md:text-xl text-slate-700 leading-relaxed whitespace-pre-wrap">
                                        {currentCard.back}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className={`mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-500 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                <Button
                    variant="outline"
                    className="h-16 flex flex-col gap-1 border-red-100 hover:bg-red-50 text-red-600"
                    onClick={() => handleRating(0)}
                >
                    <RotateCw className="w-4 h-4" />
                    <span className="text-xs font-bold">AGAIN</span>
                </Button>
                <Button
                    variant="outline"
                    className="h-16 flex flex-col gap-1 border-orange-100 hover:bg-orange-50 text-orange-600"
                    onClick={() => handleRating(1)}
                >
                    <HelpCircle className="w-4 h-4" />
                    <span className="text-xs font-bold">HARD</span>
                </Button>
                <Button
                    variant="outline"
                    className="h-16 flex flex-col gap-1 border-blue-100 hover:bg-blue-50 text-blue-600"
                    onClick={() => handleRating(2)}
                >
                    <Check className="w-4 h-4" />
                    <span className="text-xs font-bold">GOOD</span>
                </Button>
                <Button
                    variant="outline"
                    className="h-16 flex flex-col gap-1 border-green-100 hover:bg-green-50 text-green-600"
                    onClick={() => handleRating(3)}
                >
                    <FastForward className="w-4 h-4" />
                    <span className="text-xs font-bold">EASY</span>
                </Button>
            </div>

            {!isFlipped && (
                <div className="mt-10 text-center">
                    <Button
                        onClick={() => setIsFlipped(true)}
                        className="px-8 py-6 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold shadow-lg"
                    >
                        Show Answer
                    </Button>
                </div>
            )}
        </div>
    );
};

export default FlashcardDeck;
