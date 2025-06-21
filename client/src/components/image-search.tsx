import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface ImageSearchProps {
  searchTerm: string;
  onImageSelect: (imageUrl: string) => void;
}

export default function ImageSearch({ searchTerm, onImageSelect }: ImageSearchProps) {
  const [searchQuery, setSearchQuery] = useState(searchTerm);
  const [suggestedImages, setSuggestedImages] = useState<string[]>([]);

  // Unsplash image search suggestions based on common words
  const getImageSuggestions = (query: string) => {
    const baseUrl = "https://images.unsplash.com/photo-";
    const suggestions: Record<string, string[]> = {
      "CAT": ["1514888286974-6c03e2ca1dba", "1574158622682-e40e69881006", "1571566882372-1598d88abd90"],
      "DOG": ["1552053831-71594a27632d", "1587300003388-59208cc962cb", "1548199973-84fcc611f6bd"],
      "ELEPHANT": ["1551969014-7d2c4cddf0b6", "1564349683136-77e08dba1ef7", "1520637836862-4d197d17c43a"],
      "BIRD": ["1552728089-57bdde30beb3", "1444927714506-8492d94b5ba0", "1419242902214-272b3f66ee7a"],
      "FISH": ["1535591273668-578e31182c4f", "1544551763-46a013bb70d5", "1520637836862-4d197d17c43a"],
      "TREE": ["1441974231531-c6227db76b6e", "1506905925346-21bda4d32df4", "1416879595882-3373a0480b5b"],
      "HOUSE": ["1570129477492-45c003edd2be", "1505691938481-b9e30c4be8d5", "1564013799919-ab600027ffc6"],
      "BALL": ["1594736797933-d0bd1aebf67c", "1578662996442-48f60103fc96", "1571019613454-1cb2f99b2d8b"],
      "BOOK": ["1481627834876-b7833e8f5570", "1507003211169-0a1dd7228f2d", "1519452575417-564c1401ecc0"],
      "FLOWER": ["1490750967868-88aa4486c946", "1553982012-39a2abef9cde", "1416879595882-3373a0480b5b"]
    };

    const upperQuery = query.toUpperCase();
    if (suggestions[upperQuery]) {
      return suggestions[upperQuery].map(id => `${baseUrl}${id}`);
    }
    
    // Fallback suggestions for common objects
    return [
      `${baseUrl}1506905925346-21bda4d32df4`,
      `${baseUrl}1441974231531-c6227db76b6e`,
      `${baseUrl}1552053831-71594a27632d`
    ];
  };

  const handleSearch = () => {
    const suggestions = getImageSuggestions(searchQuery);
    setSuggestedImages(suggestions);
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <div className="flex-1">
          <Label htmlFor="image-search">Search for "{searchTerm}" images</Label>
          <Input
            id="image-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter search term"
          />
        </div>
        <Button onClick={handleSearch} className="mt-6">
          Search
        </Button>
      </div>

      {suggestedImages.length > 0 && (
        <div>
          <Label>Suggested Images:</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {suggestedImages.map((imageUrl, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-2">
                  <img
                    src={imageUrl}
                    alt={`Suggestion ${index + 1}`}
                    className="w-full h-20 object-cover rounded"
                    onClick={() => onImageSelect(imageUrl)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      <div className="text-sm text-gray-600">
        <p>Tips for finding good images:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Search for "{searchTerm}" on Unsplash.com</li>
          <li>Look for clear, simple images without text</li>
          <li>Choose bright, colorful photos that children can easily recognize</li>
          <li>Copy the full Unsplash photo URL</li>
        </ul>
      </div>
    </div>
  );
}