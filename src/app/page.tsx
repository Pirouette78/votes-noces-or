import { getQuestions } from "./actions";
import MainClient from "@/components/MainClient";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const initialQuestions = await getQuestions();

  return (
    <main className="min-h-screen bg-[url('https://images.unsplash.com/photo-1510076857177-7470076d4098?q=80&w=2672&auto=format&fit=crop')] bg-cover bg-center bg-fixed">
      <div className="min-h-screen bg-black/40 backdrop-blur-sm p-4 sm:p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="font-playfair text-5xl md:text-7xl text-white font-bold mb-4 drop-shadow-md">
              Noces d&apos;Or
            </h1>
            <p className="text-xl text-yellow-100 font-light tracking-wide drop-shadow">
              50 ans d&apos;amour, une infinité de questions.
            </p>
          </header>
          
          <MainClient initialQuestions={initialQuestions} />
        </div>
      </div>
    </main>
  );
}
