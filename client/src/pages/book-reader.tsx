import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ReadingBookWithPages, ReadingWord, UserProgress } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ProgressBar from "@/components/progress-bar";
import { KidPageHeader, KidBigAction } from "@/components/kid-ui";
import PhonicsBox from "@/components/phonics-box";
import {
  speak, speakPhonics, speakChunkCoach, speakSightWord, speakFingerPoint, speakEcho, isAiCoachEnabled
} from "@/lib/speech";
import { HELP_BOOK_READER, HELP_BOOK_COMPREHENSION } from "@/lib/page-help";
import { getPhonicsForWord } from "@shared/phonics";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_SIGHT_WORDS = new Set(["THE", "IS", "A", "TO", "AND", "HAS", "ON", "SAW", "IN", "IT", "AT", "MY", "WE", "CAN", "WITH", "DID", "HAD", "TEN", "SAT"]);

function getImageSrc(imageUrl: string | null | undefined): string {
  if (!imageUrl) return "";
  return imageUrl.includes("unsplash.com")
    ? `${imageUrl}?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=350`
    : imageUrl;
}

function parseTokens(text: string): string[] {
  return text.match(/[\w']+|[.,!?]/g) ?? [];
}

export default function BookReader() {
  const [, params] = useRoute("/books/:id");
  const bookId = params?.id ? parseInt(params.id) : null;
  const currentUserId = localStorage.getItem("currentUserId");
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [focusWord, setFocusWord] = useState<string | null>(null);
  const [pointingIndex, setPointingIndex] = useState(-1);
  const [showComprehension, setShowComprehension] = useState(false);
  const [showParentTips, setShowParentTips] = useState(false);
  const [showMoreHelp, setShowMoreHelp] = useState(false);
  const [highlightMode, setHighlightMode] = useState(false);
  const [activeChunkIndex, setActiveChunkIndex] = useState(-1);
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());
  const readingRef = useRef(false);
  const { toast } = useToast();

  const { data: book, isLoading } = useQuery<ReadingBookWithPages>({
    queryKey: ["/api/books", bookId],
    queryFn: () => fetch(`/api/books/${bookId}`).then(res => res.json()),
    enabled: !!bookId && !!currentUserId,
  });

  const { data: bookProgress } = useQuery<UserProgress[]>({
    queryKey: ["/api/user/progress/books", currentUserId, bookId],
    queryFn: () => fetch(`/api/user/${currentUserId}/progress/books`).then(res => res.json()),
    enabled: !!currentUserId && !!bookId,
  });

  const { data: allWords } = useQuery<ReadingWord[]>({
    queryKey: ["/api/reading/words/all"],
    queryFn: () => fetch("/api/reading/words/all").then(res => res.json()),
    enabled: !!currentUserId,
  });

  const phonicsLookup = new Map<string, string[]>();
  if (allWords) {
    for (const w of allWords) {
      const chunks = Array.isArray(w.phonics) && w.phonics.length > 0
        ? w.phonics as string[]
        : getPhonicsForWord(w.word);
      if (!w.word.includes(" ")) {
        phonicsLookup.set(w.word.toUpperCase(), chunks);
      }
    }
  }

  const sightWords = new Set([
    ...DEFAULT_SIGHT_WORDS,
    ...(Array.isArray(book?.sightWordsList) ? book.sightWordsList as string[] : []).map(w => w.toUpperCase()),
  ]);

  const currentProgress = bookProgress?.find(p => p.level === bookId);
  const completedPages = Array.isArray(currentProgress?.completedItems)
    ? currentProgress.completedItems as number[]
    : [];

  useEffect(() => {
    if (!book?.pages.length || bookProgress === undefined) return;
    const firstIncomplete = book.pages.findIndex(p => !completedPages.includes(p.id));
    setCurrentPageIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
  }, [book?.id, bookProgress]);

  useEffect(() => {
    setPointingIndex(-1);
    setFocusWord(null);
    setActiveChunkIndex(-1);
    setShowComprehension(false);
  }, [currentPageIndex]);

  const updateProgressMutation = useMutation({
    mutationFn: async ({ completedItems, stars }: { completedItems: number[]; stars: number }) => {
      return apiRequest("/api/progress", "POST", {
        userId: parseInt(currentUserId!),
        activityType: "books",
        level: bookId,
        completedItems,
        stars,
        totalItems: book?.pages.length ?? 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });

  if (!currentUserId || !bookId) {
    return (
      <div className="theme-page min-h-screen flex items-center justify-center">
        <Card className="p-8 rounded-3xl kid-shadow text-center">
          <Link href="/books">
            <Button className="bg-coral text-white rounded-2xl">Back to Books</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (isLoading || !book) {
    return (
      <div className="theme-page min-h-screen flex items-center justify-center">
        <div className="text-2xl font-fredoka text-coral">Loading book...</div>
      </div>
    );
  }

  const pages = book.pages;
  const currentPage = pages[currentPageIndex];
  const isPageCompleted = completedPages.includes(currentPage.id);
  const meta = currentPage.teachingMeta;
  const sentenceWords = parseTokens(currentPage.text);
  const wordTokens = sentenceWords.filter(t => /[\w']+/.test(t));
  const questions = Array.isArray(book.comprehensionQuestions)
    ? book.comprehensionQuestions as { question: string; answer: string }[]
    : [];
  const readingActivity = book.readingActivity as {
    title: string;
    description: string;
    words: string[];
    parentTip?: string;
    linkPath?: string;
    linkLabel?: string;
  } | null | undefined;
  const isLastPage = currentPageIndex === pages.length - 1;

  const getWordPhonics = (word: string): string[] => {
    const clean = word.replace(/[^A-Za-z]/g, "").toUpperCase();
    return phonicsLookup.get(clean) ?? getPhonicsForWord(clean);
  };

  const isSightWord = (word: string) => sightWords.has(word.replace(/[^A-Za-z]/g, "").toUpperCase());

  const hasVowelHighlight = (word: string) => {
    if (!book.vowelHighlight || !highlightMode) return false;
    const letters = word.replace(/[^A-Za-z]/g, "").toLowerCase();
    return letters.includes(book.vowelHighlight.toLowerCase());
  };

  const soundOutWord = (word: string) => {
    const clean = word.replace(/[^A-Za-z]/g, "");
    const upper = clean.toUpperCase();
    if (isSightWord(clean)) {
      speakSightWord(clean, undefined, { rate: 0.8, pitch: 1.1 });
      return;
    }
    const chunks = getWordPhonics(clean);
    speakPhonics(chunks, { rate: 0.6, pitch: 1.2 }, clean, setActiveChunkIndex);
  };

  const handleWordClick = (word: string, index: number) => {
    const clean = word.replace(/[^A-Za-z]/g, "");
    const upper = clean.toUpperCase();
    setFocusWord(upper);
    setPointingIndex(index);
    soundOutWord(word);
  };

  const handleFingerPoint = async () => {
    if (readingRef.current) return;
    readingRef.current = true;
    await speakFingerPoint(
      wordTokens,
      (i) => setPointingIndex(i),
      { rate: 0.65, pitch: 1.1 }
    );
    readingRef.current = false;
  };

  const handleReadPage = () => {
    speak(currentPage.text, { rate: 0.7, pitch: 1.1 });
  };

  const handleEcho = () => {
    speakEcho(currentPage.text, { rate: 0.7, pitch: 1.1 });
  };

  const handleSoundOutFocus = () => {
    const word = focusWord ?? wordTokens.find(w => !isSightWord(w))?.replace(/[^A-Za-z]/g, "") ?? "";
    if (!word) return;
    if (isSightWord(word)) {
      speakSightWord(word, undefined, { rate: 0.8, pitch: 1.1 });
    } else {
      speakPhonics(getWordPhonics(word), { rate: 0.6, pitch: 1.2 }, word, setActiveChunkIndex);
    }
  };

  const handleNextPage = () => {
    if (!isPageCompleted) {
      const newCompleted = [...completedPages, currentPage.id];
      const stars = Math.min(5, Math.floor(newCompleted.length / 2) + 1);
      updateProgressMutation.mutate({ completedItems: newCompleted, stars });
    }

    if (isLastPage && questions.length > 0 && !showComprehension) {
      setShowComprehension(true);
      return;
    }

    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    } else {
      toast({ title: "Book Complete! 🎉", description: `You finished "${book.title}"!` });
      setTimeout(() => { window.location.href = "/books"; }, 2000);
    }
  };

  const handleFinishBook = () => {
    toast({ title: "Book Complete! 🎉", description: `You finished "${book.title}"!` });
    setTimeout(() => { window.location.href = "/books"; }, 2000);
  };

  const handlePreviousPage = () => {
    if (showComprehension) {
      setShowComprehension(false);
      return;
    }
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  return (
    <div className="theme-page min-h-screen pb-28">
      <KidPageHeader
        backHref="/books"
        backLabel="Stories"
        title={book.title}
        emoji="📖"
        stars={currentProgress?.stars || 0}
        helpText={showComprehension ? HELP_BOOK_COMPREHENSION : HELP_BOOK_READER}
      >
        <ProgressBar current={currentPageIndex + 1} total={pages.length} color="coral" />
      </KidPageHeader>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {showComprehension ? (
          <Card className="rounded-[2.5rem] p-8 kid-shadow theme-card">
            <h3 className="text-2xl font-fredoka text-gray-800 mb-2 text-center">📖 Story Questions</h3>
            <p className="text-sm text-gray-600 font-bold text-center mb-6">
              Talk about the story together!
            </p>
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 kid-shadow">
                  <p className="font-bold text-gray-800 mb-2">{q.question}</p>
                  {revealedAnswers.has(i) ? (
                    <p className="text-green-700 font-bold text-sm">✓ {q.answer}</p>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl text-sm"
                      onClick={() => setRevealedAnswers(prev => new Set([...prev, i]))}
                    >
                      Show answer
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {readingActivity && (
              <Card className="mt-6 rounded-2xl p-5 theme-card">
                <h4 className="text-lg font-fredoka text-orange-800 mb-2 text-center">
                  🎨 {readingActivity.title}
                </h4>
                <p className="text-sm font-bold text-gray-700 text-center mb-4">
                  {readingActivity.description}
                </p>
                <div className="flex flex-wrap justify-center gap-3 mb-4">
                  {readingActivity.words.map((w) => (
                    <Button
                      key={w}
                      size="sm"
                      onClick={() => {
                        const chunks = getWordPhonics(w);
                        setFocusWord(w.toUpperCase());
                        speakPhonics(chunks, { rate: 0.55, pitch: 1.2 }, w, setActiveChunkIndex);
                      }}
                      className="bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600"
                    >
                      {w}
                    </Button>
                  ))}
                </div>
                {readingActivity.parentTip && (
                  <p className="text-xs text-orange-700 font-medium text-center italic">
                    💡 {readingActivity.parentTip}
                  </p>
                )}
                {readingActivity.linkPath && (
                  <Link href={readingActivity.linkPath}>
                    <Button className="w-full mt-4 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl font-bold">
                      {readingActivity.linkLabel ?? "More Practice ✨"}
                    </Button>
                  </Link>
                )}
              </Card>
            )}
            <Button
              onClick={handleFinishBook}
              className="w-full mt-6 bg-coral text-white py-4 rounded-2xl font-bold text-xl"
            >
              Finish Book! 🎉
            </Button>
          </Card>
        ) : (
          <motion.div
            key={currentPage.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {meta?.readTogether && (
              <div className="bg-sunnyellow/30 border-2 border-sunnyellow rounded-2xl p-3 mb-4 text-center">
                <p className="font-bold text-gray-800">👫 Read this page together!</p>
                {meta.actionHint && (
                  <p className="text-sm font-bold text-orange-700 mt-1">{meta.actionHint}</p>
                )}
              </div>
            )}
            {meta?.actionHint && !meta?.readTogether && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-3 mb-4 text-center">
                <p className="font-bold text-orange-800">{meta.actionHint}</p>
              </div>
            )}

            <img
              src={getImageSrc(currentPage.imageUrl)}
              alt={`Illustration for page ${currentPage.pageNumber}`}
              className="w-full h-56 object-cover rounded-[2rem] mb-6 kid-shadow"
            />

            <Card className="rounded-[2.5rem] p-8 kid-shadow theme-card mb-4">
              <div className="text-4xl sm:text-5xl font-bold text-gray-800 leading-relaxed mb-4">
                {sentenceWords.map((token, i) => {
                  if (/^[.,!?]$/.test(token)) {
                    return <span key={i}>{token} </span>;
                  }
                  const idx = sentenceWords.slice(0, i).filter(t => /[\w']+/.test(t)).length;
                  const upper = token.replace(/[^A-Za-z]/g, "").toUpperCase();
                  const isPointing = pointingIndex === idx;
                  const isFocus = focusWord === upper;
                  const isSight = isSightWord(token);
                  const isHighlighted = hasVowelHighlight(token);

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleWordClick(token, idx)}
                      className={`inline mx-1 px-2 py-1 rounded-xl transition-all touch-friendly border-2 ${
                        isPointing || isFocus
                          ? isSight
                            ? "bg-purple-500 text-white border-purple-600 scale-110 shadow-lg"
                            : "bg-coral text-white border-coral scale-110 shadow-lg"
                          : isHighlighted
                            ? "bg-yellow-300 text-gray-900 border-yellow-400 shadow-md"
                            : isSight
                              ? "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200"
                              : "hover:bg-coral/20 text-gray-800 border-transparent"
                      }`}
                    >
                      {isPointing && <span className="mr-1">👆</span>}
                      {token}
                    </button>
                  );
                })}
              </div>

              <p className="text-center text-sm font-bold text-gray-500 mb-3">
                Tap a word to hear it!
              </p>

              {focusWord && !isSightWord(focusWord) && (
                <div className="flex justify-center flex-wrap gap-3 mb-4">
                  {getWordPhonics(focusWord).map((chunk, index) => (
                    <PhonicsBox
                      key={index}
                      chunk={chunk}
                      color={index === 0 ? "coral" : index === 1 ? "turquoise" : index === 2 ? "sunnyellow" : index === 3 ? "mintgreen" : "skyblue"}
                      onClick={() => speakChunkCoach(chunk, { rate: 0.6, pitch: 1.1 })}
                      isActive={activeChunkIndex === index}
                    />
                  ))}
                </div>
              )}

              {showMoreHelp && (
                <>
                  <div className="flex flex-wrap gap-2 justify-center text-xs font-bold mb-3">
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Purple = sight word</span>
                    {book.vowelHighlight && (
                      <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                        Yellow = Short {book.vowelHighlight.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {book.vowelHighlight && (
                    <div className="flex justify-center mb-3">
                      <Button
                        size="sm"
                        variant={highlightMode ? "default" : "outline"}
                        onClick={() => setHighlightMode(!highlightMode)}
                        className={`rounded-xl font-bold ${highlightMode ? "bg-yellow-400 text-gray-900 hover:bg-yellow-500" : ""}`}
                      >
                        🖍️ Highlight Game {highlightMode ? "ON" : "OFF"}
                      </Button>
                    </div>
                  )}
                </>
              )}

              {showMoreHelp && meta?.phonicsHints && meta.phonicsHints.length > 0 && (
                <div className="bg-green-50 rounded-2xl p-4 mb-3">
                  <p className="text-sm font-bold text-green-800 mb-2">🔤 Sound out:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {meta.phonicsHints.map((hint, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          const word = hint.replace(/-/g, "");
                          speakPhonics(hint.split("-"), { rate: 0.55, pitch: 1.2 }, word, setActiveChunkIndex);
                        }}
                        className="bg-green-500 text-white px-3 py-1 rounded-xl font-bold hover:bg-green-600 touch-friendly"
                      >
                        {hint}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showMoreHelp && sightWords.size > 0 && (
                <div className="bg-purple-50 rounded-2xl p-3 text-center">
                  <p className="text-xs font-bold text-purple-700">
                    Sight words in this story: {[...sightWords].slice(0, 8).join(", ")}
                  </p>
                </div>
              )}
            </Card>

            {meta?.parentNote && (
              <Card className="rounded-2xl p-4 mb-4 theme-card">
                <button
                  type="button"
                  onClick={() => setShowParentTips(!showParentTips)}
                  className="w-full text-left font-bold text-blue-800 text-sm"
                >
                  💡 Tips for grown-ups {showParentTips ? "▲" : "▼"}
                </button>
                {showParentTips && (
                  <p className="text-sm text-blue-700 mt-2 font-medium">{meta.parentNote}</p>
                )}
              </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <KidBigAction emoji="👆" label="Tap Words" onClick={handleFingerPoint} className="bg-orange-500 text-white hover:bg-orange-600" />
              <KidBigAction emoji="🔊" label="Hear Story" onClick={handleReadPage} className="bg-blue-500 text-white hover:bg-blue-600" />
            </div>

            <button
              type="button"
              onClick={() => setShowMoreHelp(!showMoreHelp)}
              className="w-full text-sm font-bold text-gray-400 py-2 mb-4"
            >
              {showMoreHelp ? "Less help ▲" : "More help (grown-ups) ▼"}
            </button>

            {showMoreHelp && (
              <div className="flex justify-center gap-3 mb-6 flex-wrap">
                <Button onClick={handleEcho} className="bg-teal-500 text-white px-5 py-3 rounded-2xl font-bold hover:bg-teal-600 kid-tap">
                  🔁 Echo
                </Button>
                <Button onClick={handleSoundOutFocus} className="bg-green-500 text-white px-5 py-3 rounded-2xl font-bold hover:bg-green-600 kid-tap">
                  🔤 Sound Out
                </Button>
              </div>
            )}

            {isPageCompleted && (
              <p className="text-green-600 font-bold text-center mb-4">✅ Page completed!</p>
            )}
          </motion.div>
        )}

        {!showComprehension && (
          <div className="flex justify-center gap-4">
            <Button
              onClick={handlePreviousPage}
              disabled={currentPageIndex === 0}
              variant="outline"
              className="kid-tap px-6 py-6 rounded-2xl font-fredoka font-bold text-lg kid-shadow"
            >
              ⬅️ Back
            </Button>
            <Button
              onClick={handleNextPage}
              className="kid-tap bg-coral text-white px-8 py-6 rounded-2xl font-fredoka font-bold text-xl kid-shadow btn-pressable"
            >
              {isLastPage ? (questions.length > 0 ? "Questions ➡️" : "Done! 🎉") : "Next ➡️"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
