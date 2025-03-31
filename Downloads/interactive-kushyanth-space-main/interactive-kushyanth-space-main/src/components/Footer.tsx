
import { ArrowUp } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-portfolio-blue py-8 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <p className="text-lg font-bold">Kushyanth Reddy</p>
            <p className="text-sm text-white/70">Web Developer & Designer</p>
          </div>

          <button
            onClick={scrollToTop}
            className="rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </button>

          <div className="text-sm text-white/70">
            &copy; {currentYear} Kushyanth Reddy. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
