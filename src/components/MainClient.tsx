'use client';

import { useState } from 'react';
import { Question, addQuestion, voteQuestion } from '@/app/actions';
import { Star, LogOut, Send, ThumbsUp } from 'lucide-react';

const USERS = [
  "Louis", "Charlotte", "Fanny", "Jerome", "Isabelle", 
  "Nicolas", "Pierre", "Catherine", "Benjamin", "Marie"
];

export default function MainClient({ initialQuestions }: { initialQuestions: Question[] }) {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Écran de connexion (Sélection de profil)
  if (!currentUser) {
    return (
      <div className="flex justify-center items-center mt-20">
        <div className="bg-white/90 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md border border-neutral-200/50">
          <h2 className="font-playfair text-3xl text-center mb-8 text-neutral-800 font-semibold">
            Qui êtes-vous ?
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {USERS.map((user) => (
              <button
                key={user}
                onClick={() => setCurrentUser(user)}
                className="py-3 px-4 rounded-xl bg-white text-neutral-700 font-medium border border-neutral-200 hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-700 transition-all duration-300 shadow-sm hover:shadow"
              >
                {user}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setIsSubmitting(true);
    await addQuestion(newQuestion, currentUser);
    setNewQuestion("");
    setIsSubmitting(false);
  };

  const parseVoters = (votersStr: string | null) => {
    if (!votersStr) return [];
    return votersStr.split(',').map(v => {
      const [name, rating] = v.split(':');
      return { name, rating: parseInt(rating, 10) };
    });
  };

  // Calculer le classement pour la colonne de droite
  const leaderboard = [...initialQuestions].sort((a, b) => {
    if (b.average_rating !== a.average_rating) {
      return b.average_rating - a.average_rating; // Plus haute note en premier
    }
    return b.id - a.id; // En cas d'égalité, le plus récent
  });

  // UI Principale
  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 flex justify-between items-center shadow-lg border border-white/50">
        <div>
          <p className="text-sm text-neutral-500 uppercase tracking-widest font-semibold flex items-center gap-2">
            Connecté en tant que
          </p>
          <p className="text-2xl font-playfair font-bold text-neutral-800">
            {currentUser}
          </p>
        </div>
        <button
          onClick={() => setCurrentUser(null)}
          className="flex items-center gap-2 text-neutral-600 hover:text-red-500 transition-colors px-4 py-2 rounded-lg hover:bg-neutral-100"
        >
          <LogOut size={18} />
          <span className="font-medium hidden sm:inline">Changer d&apos;utilisateur</span>
        </button>
      </div>

      {/* Layout double colonne */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* COLONNE GAUCHE : Zone de Vote (Ordre Fixe) */}
        <div className="space-y-8">
          {/* Ajouter une question */}
          <div className="bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-xl border border-white/50 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-yellow-300 to-yellow-600"></div>
            <h3 className="font-playfair text-2xl font-semibold mb-6 flex items-center gap-3">
              Poser une nouvelle question
            </h3>
            <form onSubmit={handleAddQuestion} className="flex flex-col gap-4">
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Quelle est le secret de votre amour après toutes ces années ?"
                className="w-full p-4 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none text-neutral-800 placeholder:text-neutral-400 font-medium"
                rows={3}
                maxLength={300}
                required
              />
              <div className="flex justify-end">
                <button
                  disabled={isSubmitting || !newQuestion.trim()}
                  type="submit"
                  className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
                >
                  <span>{isSubmitting ? 'Envoi...' : 'Ajouter'}</span>
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>

          {/* Liste des questions (Fixe) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-playfair text-2xl font-bold text-white drop-shadow-md">
                Toutes les questions
              </h2>
            </div>
            
            {initialQuestions.length === 0 ? (
              <div className="bg-white/60 backdrop-blur p-8 rounded-3xl text-center border border-white/30">
                <p className="text-neutral-600 font-medium text-lg">Soyez le premier à poser une question !</p>
              </div>
            ) : (
              <div className="space-y-5">
                {initialQuestions.map((q) => {
                  const voters = parseVoters(q.voters);
                  const myVote = voters.find(v => v.name === currentUser)?.rating || 0;
                  const hasVoted = myVote > 0;
                  const votersNames = voters.map(v => v.name).join(', ');

                  return (
                    <div key={q.id} className={`backdrop-blur-md rounded-3xl p-6 shadow-lg border transition-all flex flex-col gap-4 ${hasVoted ? 'bg-green-50/90 border-green-200' : 'bg-white/95 border-neutral-100'}`}>
                      
                      {/* Contenu de la question */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-bold tracking-wider uppercase text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
                            De : {q.author_name}
                          </span>
                          {hasVoted && (
                             <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-green-700 bg-green-200 px-3 py-1 rounded-full">
                               <ThumbsUp size={14} /> Déjà voté
                             </span>
                          )}
                        </div>
                        <h3 className="text-lg font-medium text-neutral-800 leading-snug">
                          « {q.text} »
                        </h3>
                        
                        {/* Liste des votants */}
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-neutral-400">Votants :</span>
                          {voters.length > 0 ? (
                            <p className="text-xs font-medium text-neutral-600">
                              {votersNames}
                            </p>
                          ) : (
                            <span className="text-xs text-neutral-400 italic">Aucun</span>
                          )}
                        </div>
                      </div>

                      {/* Zone de vote */}
                      <div className="flex items-center justify-between bg-neutral-50 px-4 py-3 rounded-2xl border border-neutral-100 shadow-inner">
                        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest block">
                          {hasVoted ? "Mon vote" : "Voter"}
                        </span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => voteQuestion(q.id, currentUser, star)}
                              className={`p-1 cursor-pointer transition-all ${star <= myVote ? 'text-yellow-400 drop-shadow-sm scale-110' : 'text-neutral-300 hover:text-yellow-200 hover:scale-110'}`}
                            >
                              <Star fill={star <= myVote ? 'currentColor' : 'none'} size={24} strokeWidth={2} />
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* COLONNE DROITE : Classement en direct */}
        <div className="lg:sticky lg:top-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-playfair text-3xl font-bold text-yellow-200 drop-shadow-md">
              Meilleures questions
            </h2>
          </div>
          
          <div className="bg-black/60 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-yellow-500/20">
            {leaderboard.length === 0 ? (
               <p className="text-neutral-300 text-center italic">Le classement apparaitra ici.</p>
            ) : (
              <div className="space-y-4">
                {leaderboard.map((q, index) => {
                  return (
                    <div key={q.id} className="flex items-center gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0">
                      {/* Rang (1, 2, 3...) */}
                      <div className="flex-shrink-0 w-8 text-center text-yellow-500 font-bold font-playfair text-xl">
                        #{index + 1}
                      </div>

                      {/* Question Text */}
                      <div className="flex-1">
                        <p className="text-white text-sm leading-tight line-clamp-2" title={q.text}>
                          {q.text}
                        </p>
                        <p className="text-xs text-yellow-300/60 mt-1 uppercase tracking-wider">
                          Par {q.author_name}
                        </p>
                      </div>

                      {/* Note */}
                      <div className="flex-shrink-0 bg-yellow-500/10 px-3 py-2 rounded-xl flex flex-col items-center justify-center border border-yellow-500/20">
                        <span className="text-yellow-400 font-bold text-lg">
                          {q.average_rating > 0 ? q.average_rating.toFixed(1) : '-'}
                        </span>
                        <Star className="text-yellow-400 mt-0.5" fill="currentColor" size={12} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
