
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false);
    const section = document.getElementById(sectionId);
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? 'bg-white/90 shadow-md backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div 
          className="text-2xl font-bold tracking-tight text-portfolio-blue cursor-pointer"
          onClick={() => scrollToSection('home')}
        >
          <span className="gradient-heading">K</span>ushyanth
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden space-x-8 md:flex">
          <div className="nav-link" onClick={() => scrollToSection('home')}>Home</div>
          <div className="nav-link" onClick={() => scrollToSection('about')}>About</div>
          <div className="nav-link" onClick={() => scrollToSection('projects')}>Projects</div>
          <div className="nav-link" onClick={() => scrollToSection('skills')}>Skills</div>
          <div className="nav-link" onClick={() => scrollToSection('contact')}>Contact</div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="text-portfolio-blue focus:outline-none md:hidden"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute left-0 top-full z-50 w-full bg-white p-4 shadow-md md:hidden">
            <div className="flex flex-col space-y-4">
              <div className="nav-link" onClick={() => scrollToSection('home')}>Home</div>
              <div className="nav-link" onClick={() => scrollToSection('about')}>About</div>
              <div className="nav-link" onClick={() => scrollToSection('projects')}>Projects</div>
              <div className="nav-link" onClick={() => scrollToSection('skills')}>Skills</div>
              <div className="nav-link" onClick={() => scrollToSection('contact')}>Contact</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
