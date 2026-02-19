
import React, { useEffect, useState } from 'react';
import { Tutorial } from '../types';
import { mockDb } from '../services/mockData';

const TutorialPage: React.FC = () => {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);

  useEffect(() => {
    mockDb.getTutorials().then(setTutorials);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-zinc-900 mb-4">Pusat Bantuan</h1>
        <p className="text-slate-500">Pelajari cara menggunakan layanan kami dengan maksimal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {tutorials.map(tut => (
          <div key={tut.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {tut.video_url && (
              <div className="aspect-video bg-black">
                <iframe 
                  className="w-full h-full" 
                  src={tut.video_url} 
                  title={tut.title}
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            )}
            <div className="p-8">
              <h3 className="text-xl font-bold mb-4">{tut.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{tut.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TutorialPage;
