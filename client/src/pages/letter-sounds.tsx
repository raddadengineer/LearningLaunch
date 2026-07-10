import { KidPageHeader } from "@/components/kid-ui";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function LetterSounds() {
  return (
    <div className="theme-page min-h-screen pb-28">
      <KidPageHeader title="Letter Sounds" emoji="🎵" stars={0} helpText="Watch the videos to learn letter sounds!" />
      <div className="container mx-auto px-4 pt-8 max-w-4xl text-center">
        <div className="space-y-8 mb-8">
          <Card className="rounded-[2.5rem] p-6 kid-shadow theme-card">
            <div className="relative overflow-hidden rounded-2xl" style={{ paddingBottom: "56.25%", height: 0 }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/ChqnN3cKzXQ"
                title="Letter Sounds Video 1"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </Card>
          <Card className="rounded-[2.5rem] p-6 kid-shadow theme-card">
            <div className="relative overflow-hidden rounded-2xl" style={{ paddingBottom: "56.25%", height: 0 }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/XAXyskFDYXw"
                title="Letter Sounds Video 2"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </Card>
          <Card className="rounded-[2.5rem] p-6 kid-shadow theme-card">
            <div className="relative overflow-hidden rounded-2xl" style={{ paddingBottom: "56.25%", height: 0 }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/_TM_-0-ayFk"
                title="Short and Long Vowel Chant Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </Card>
          <Card className="rounded-[2.5rem] p-6 kid-shadow theme-card">
            <div className="relative overflow-hidden rounded-2xl" style={{ paddingBottom: "56.25%", height: 0 }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/n0OTGGiJPpE"
                title="ABC Animals Phonics Chant Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </Card>
        </div>
        <Link href="/">
          <Button className="bg-gray-100 text-gray-700 px-8 py-6 rounded-[2rem] font-fredoka font-bold text-xl kid-shadow">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
