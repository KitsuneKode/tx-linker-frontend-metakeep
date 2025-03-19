
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import DeveloperForm from '@/components/DeveloperForm';
import AnimatedBackground from '@/components/AnimatedBackground';
import { logPageView } from '@/lib/metakeep';

const Index: React.FC = () => {
  // Log page view when component mounts
  useEffect(() => {
    logPageView('home_page');
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <Header />

      <main className="flex-1 container px-4 py-12 max-w-6xl">
        <div className="text-center mb-12 space-y-4 animate-fade-in">
          <div className="inline-block">
            <span className="bg-primary/10 text-primary text-xs px-4 py-1.5 rounded-full font-medium">
              Web3 Developer Tool
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            Transaction Linker
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create and share smart contract transactions with embedded wallets
          </p>
        </div>

        <div className="mt-8">
          <DeveloperForm />
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Built with MetaKeep embedded wallet technology</p>
      </footer>
    </div>
  );
};

export default Index;
