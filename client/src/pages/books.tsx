import { useQuery } from "@tanstack/react-query";
import { ReadingBookSummary, UserProgress } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { KidPageHeader } from "@/components/kid-ui";

function getImageSrc(imageUrl: string | null | undefined): string {
  if (!imageUrl) return "";
  return imageUrl.includes("unsplash.com")
    ? `${imageUrl}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300`
    : imageUrl;
}


export default function Books() {
  const currentUserId = localStorage.getItem("currentUserId");

  const { data: books, isLoading } = useQuery<ReadingBookSummary[]>({
    queryKey: ["/api/books"],
    queryFn: () => fetch("/api/books").then(res => res.json()),
    enabled: !!currentUserId,
  });

  const { data: bookProgress } = useQuery<UserProgress[]>({
    queryKey: ["/api/user/progress/books", currentUserId],
    queryFn: () => fetch(`/api/user/${currentUserId}/progress/books`).then(res => res.json()),
    enabled: !!currentUserId,
  });

  if (!currentUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 rounded-3xl kid-shadow text-center">
          <p className="text-xl font-bold text-gray-600 mb-4">Please select a user first.</p>
          <Link href="/select-user">
            <Button className="bg-coral text-white rounded-2xl">Select User</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-fredoka text-coral">Loading books...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      <KidPageHeader title="Stories" emoji="📖" />

      <main className="container mx-auto px-4 py-6">
        <p className="text-center text-lg font-fredoka font-bold text-gray-600 mb-6">
          Tap a book to read!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {books?.map((book, index) => {
            const progress = bookProgress?.find(p => p.level === book.id);
            const completed = Array.isArray(progress?.completedItems) ? progress.completedItems.length : 0;
            const total = book.pageCount || progress?.totalItems || 1;
            const isDone = completed >= total;

            return (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Link href={`/books/${book.id}`}>
                  <Card className="rounded-[2rem] overflow-hidden kid-shadow cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform bg-white kid-tap">
                    <img
                      src={getImageSrc(book.coverImageUrl)}
                      alt={book.title}
                      className="w-full h-48 sm:h-52 object-cover"
                    />
                    <div className="p-5 text-center">
                      <h3 className="text-2xl font-fredoka text-gray-800">{book.title}</h3>
                      {isDone ? (
                        <p className="text-lg font-bold text-green-600 mt-2">✅ Done!</p>
                      ) : (
                        <p className="text-sm font-bold text-coral mt-2">Tap to read 📖</p>
                      )}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {(!books || books.length === 0) && (
          <Card className="p-8 rounded-3xl kid-shadow text-center max-w-md mx-auto">
            <div className="text-4xl mb-4">📚</div>
            <p className="text-gray-600 font-bold">No books available yet. Check back soon!</p>
          </Card>
        )}
      </main>
    </div>
  );
}
