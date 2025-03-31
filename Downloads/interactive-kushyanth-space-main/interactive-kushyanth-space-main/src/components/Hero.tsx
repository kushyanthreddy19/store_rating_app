
import { ArrowDownCircle, Github, Linkedin, Mail } from 'lucide-react';

const Hero = () => {
  const scrollToNextSection = () => {
    const aboutSection = document.getElementById('about');
    aboutSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-portfolio-cream">
      <div className="absolute -z-10 h-full w-full">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-portfolio-lightpurple/20 blur-3xl"></div>
        <div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-portfolio-purple/20 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 text-center">
        <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
          <p className="mb-3 text-lg font-medium text-portfolio-purple">Hello, I'm</p>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-portfolio-blue sm:text-6xl md:text-7xl">
            Kushyanth <span className="gradient-heading">Reddy</span>
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-lg text-portfolio-blue/80 sm:text-xl">
            A passionate developer focused on creating interactive digital experiences
            with smooth animations and engaging user interfaces
          </p>
        </div>
        
        <div className="flex justify-center space-x-6 animate-fade-in opacity-0" style={{ animationDelay: '0.5s' }}>
          <a href="https://github.com/" target="_blank" rel="noreferrer" 
            className="rounded-full bg-white p-3 shadow-md transition-transform duration-300 hover:scale-110 hover:shadow-lg">
            <Github className="h-6 w-6 text-portfolio-blue" />
          </a>
          <a href="https://linkedin.com/" target="_blank" rel="noreferrer"
            className="rounded-full bg-white p-3 shadow-md transition-transform duration-300 hover:scale-110 hover:shadow-lg">
            <Linkedin className="h-6 w-6 text-portfolio-blue" />
          </a>
          <a href="mailto:example@email.com"
            className="rounded-full bg-white p-3 shadow-md transition-transform duration-300 hover:scale-110 hover:shadow-lg">
            <Mail className="h-6 w-6 text-portfolio-blue" />
          </a>
        </div>
        
        <div className="mt-16 animate-fade-in opacity-0" style={{ animationDelay: '0.8s' }}>
          <button
            onClick={scrollToNextSection}
            className="rounded-full bg-transparent text-portfolio-blue transition-all duration-300 hover:text-portfolio-purple"
          >
            <ArrowDownCircle className="h-10 w-10 animate-float" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
